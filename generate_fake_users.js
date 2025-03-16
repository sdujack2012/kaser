import axios from "axios";
import fs from "fs";

axios.get('https://randomuser.me/api/?results=5000&nat=AU&gender=female&inc=id,gender,name,nat,email,picture', {}) // sends a POST request to "/users/login" with data
  .then(res => {
    var json = JSON.stringify(res.data.results);
    fs.writeFileSync('./fakeusers.json', json, 'utf8');
  })

