import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import dotenv from "dotenv";

dotenv.config();

const shopify = shopifyApi({
  apiSecretKey: process.env.apiSecretKey, // Note: this is the API Secret Key, NOT the API access token
  apiVersion: ApiVersion.October24,
  isCustomStoreApp: true, // this MUST be set to true (default is false)
  adminApiAccessToken: process.env.adminApiAccessToken, // Note: this is the API access token, NOT the API Secret Key
  isEmbeddedApp: false,
  hostName: process.env.shopName,
  scopes: ["write_files", "write_themes"],
});

const session = shopify.session.customAppSession(process.env.shopName);
const client = new shopify.clients.Graphql({ session });

export async function retrieveProductTemplateFile(templateId, productId) {
  const productIdNumberPart = productId.match(/\d{1,}/gim)[0];
  const data = await throwableQuery({
    data: `query {
      theme(id: "gid://shopify/OnlineStoreTheme/${templateId}") {
        id
        name
        role
        files(filenames: ["templates/product.${productIdNumberPart}.json"], first: 1) {
          nodes {
            body {
              ... on OnlineStoreThemeFileBodyText {
                content
              }
            }
          }
        }
      }

    }`,
  });

  return data.theme.files.nodes[0].body.content.match(
    /^[\{\[][\s\S]*[\}\]]$/gim
  )[0];
}

export async function insertProductTemplate(templateId, productId, template) {
  const productIdNumberPart = productId.match(/\d{1,}/gim)[0];
  const data = await throwableQuery({
    data: {
      query: `mutation themeFilesUpsert($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
        themeFilesUpsert(files: $files, themeId: $themeId) {
          upsertedThemeFiles {
            filename
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        themeId: `gid://shopify/OnlineStoreTheme/${templateId}`,
        files: [
          {
            filename: `templates/product.${productIdNumberPart}.json`,
            body: {
              type: "TEXT",
              value: template,
            },
          },
        ],
      },
    },
  });
  return data;
}

export async function uploadImage(imageUrl, imageDescription) {
  const data = await throwableQuery({
    data: {
      query: `mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
            alt
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        files: {
          alt: imageDescription,
          contentType: "IMAGE",
          originalSource: imageUrl,
        },
      },
    },
  });

  return data;
}

export async function getImageById(shopifyImageId) {
  const data = await throwableQuery({
    data: `query {
    node(id: "${shopifyImageId}") {
      id
      ... on MediaImage {
        image {
          url
        }
      }
    }
  }`,
  });

  return data;
}

export function convertToShopifyUrl(url) {
  return url
    .replace(/https[\S]{1,}files\//gm, "shopify://shop_images/")
    .replace(/\.jpg[\S]{1,}/gm, ".jpg");
}

export async function retrieveProducts() {
  const client = new shopify.clients.Graphql({ session });
  const data = await throwableQuery({
    data: `# Define the fragment outside the query
fragment fieldsForMediaTypes on Media {
  alt
  mediaContentType
  preview {
    image {
      id
      altText
      url
    }
  }
  status
  ... on Video {
    id
    sources {
      format
      height
      mimeType
      url
      width
    }
    originalSource {
      format
      height
      mimeType
      url
      width
    }
  }
  ... on ExternalVideo {
    id
    host
    embeddedUrl
  }
  ... on Model3d {
    sources {
      format
      mimeType
      url
    }
    originalSource {
      format
      mimeType
      url
    }
  }
  ... on MediaImage {
    id
    image {
      altText
      url
    }
  }
}

# Main query
query {
  products(first: 250) {
    edges {
      node {
        id
        title
        handle
        description
        templateSuffix
        media(first: 5) {
          edges {
            node {
              ...fieldsForMediaTypes
            }
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
    }
  }
}`,
  });
  return data.products.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    description: edge.node.description,
    handle: edge.node.handle,
    images: edge.node.media.edges
      .filter((edge) => edge.node.image?.url)
      .map((edge) => convertToShopifyUrl(edge.node.image.url)),
    templateSuffix: edge.node.templateSuffix,
  }));
}

export async function retrieveProductById(productId) {
  // Define the GraphQL query to fetch a product by ID
  const data = await throwableQuery({
    data: {
      query: `query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        description
        handle
        templateSuffix
        images(first: 1) {
          edges {
            node {
              src
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
      variables: { id: productId },
    },
  });

  return data;
}

export async function updateProductTemplate(productId) {
  const productIdNumberPart = productId.match(/\d{1,}/gim)[0];
  const data = await throwableQuery({
    data: {
      query: `mutation UpdateProductWithNewMedia($input: ProductInput!,  $media: [CreateMediaInput!]) {
        productUpdate(input: $input, media: $media) {
          product {
            id
            templateSuffix
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        input: {
          id: productId,
          templateSuffix: productIdNumberPart,
        },
      },
    },
  });

  return data;
}

export async function updateProductTitle(productId, title) {
  const data = await throwableQuery({
    data: {
      query: `mutation UpdateProductWithNewMedia($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          media(first: 10) {
            nodes {
              alt
              mediaContentType
              preview {
                status
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
      variables: {
        input: {
          id: productId,
          title,
        },
      },
    },
  });

  return data;
}

export async function createProduct(productInfo) {
  const data = await throwableQuery({
    data: {
      query: `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        descriptionHtml
        options {
          id
          name
          position
          optionValues {
            id
            name
            hasVariants
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`,
      variables: {
        input: {
          title: productInfo.title,
          descriptionHtml: productInfo.description,
          productOptions: productInfo.productOptions, // Ensure this matches the schema
        },
      },
    },
  });

  return data; // Return the response data
}

export async function addMediaToProduct(productId, media) {
  // Define the GraphQL query to fetch a product by ID
  const data = await throwableQuery({
    data: {
      query: `mutation AddProductMedia($productId: ID!, $media: [CreateMediaInput!]!) {
  productCreateMedia(productId: $productId, media: $media)
  {
      product {
        id
      }
      media {
        id
        alt
        mediaContentType
      }
      userErrors {
        field
        message
      }
    }
  }
  `,
      variables: {
        productId,
        media,
      },
    },
  });

  console.log(JSON.stringify(data, null, 4));

  return data;
}

export async function addVariantsToProduct(productId, variantInfos) {
  // Define the GraphQL query to fetch a product by ID
  const data = await throwableQuery({
    data: {
      query: `mutation CreateProductVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(
    productId: $productId,
    variants: $variants
  ) {
    productVariants {
      id
      title
      selectedOptions {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
  `,
      variables: {
        productId,
        variants: variantInfos,
      },
    },
  });
  return data;
}

export async function updateVariants(productId, variantInfos) {
  // Define the GraphQL query to fetch a product by ID
  const data = await throwableQuery({
    data: {
      query: `mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(
    productId: $productId,
    variants: $variants
  ) {
    productVariants {
      id
      title
      media(first: 10) {
        nodes {
          id
          alt
          mediaContentType
          preview {
            status
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
  `,
      variables: {
        productId,
        variants: variantInfos,
      },
    },
  });

  return data;
}

async function getLocation() {
  const data = await throwableQuery({
    data: {
      query: `query {
    locations(first: 5) {
      edges {
        node {
          id
          name
          address {
            formatted
          }
        }
      }
    }
  }`,
    },
  });

  return data;
}

async function deleteProductVariants(productId, variantsIds) {
  const data = await throwableQuery({
    data: {
      query: `mutation bulkDeleteProductVariants($productId: ID!, $variantsIds: [ID!]!) {
      productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }`,
      variables: {
        productId,
        variantsIds,
      },
    },
  });

  return data;
}

async function addProduct(productSet) {
  const data = await throwableQuery({
    data: {
      query: `mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
        productSet(synchronous: $synchronous, input: $productSet) {
          product {
            id
          }
          productSetOperation {
            id
            status
            userErrors {
              code
              field
              message
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }`,
      variables: {
        synchronous: true,
        productSet: productSet,
      },
    },
  });

  return data;
}

async function throwableQuery(query) {
  const res = await client.query(query);

  if (res.body.data.userErrors?.length) {
    console.log(JSON.stringify(res.body.data.userErrors, null, 4));
    throw res.body.data.userErrors;
  }

  return res.body.data;
}

export async function createProductWithImagesAndVariants(
  productInfo,
  imageUrls,
  variantInfos
) {
  const {
    locations: {
      edges: [
        {
          node: { id: locationId },
        },
      ],
    },
  } = await getLocation();

  const allImages = [
    ...new Set([
      ...variantInfos.map((variantInfo) => variantInfo.imageUrl),
      ...imageUrls,
    ]),
  ];
  const {
    productSet: { product },
  } = await addProduct({
    title: productInfo.title,
    descriptionHtml: productInfo.description,
    files: allImages.map((imageUrl) => ({
      contentType: "IMAGE",
      alt: productInfo.title,
      originalSource: imageUrl,
    })),
    productOptions: productInfo.productOptions, // Ensure this matches the schema
    variants: variantInfos.map((variantInfo) => ({
      price: variantInfo.price * 3,
      optionValues: variantInfo.optionValues.map((optionValue) => ({
        name: optionValue.name,
        optionName: optionValue.optionName,
      })),
      inventoryQuantities: {
        locationId,
        quantity: 100,
        name: "on_hand",
      },
      inventoryItem: {
        cost: variantInfo.price,
        tracked: true,
      },
      file: {
        alt: productInfo.title,
        contentType: "IMAGE",
        originalSource: variantInfo.imageUrl,
      },
    })),
  });
  return product;
}
