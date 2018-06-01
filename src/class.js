import axios from "axios";
import chalk from "chalk";

class myClass {
  constructor(id) {
    this.id = id;
    this.article = {};
  }
  printID() {
    console.log(this.id);
  }
  getArticleWithFunction() {
    let url = `https://jsonplaceholder.typicode.com/posts/${this.id}`;
    console.log("url getArticleWithFunction", url);
    axios
      .get(url)
      .then(function(res) {
        console.log(chalk.red("\n this.id", this.id), "\n");
        console.log(res.data);
      })
      .catch(err => {
        console.log(chalk.red("error in getArticleWithFunction", err));
      });
  }
  getArticleWithArrow() {
    let url = `https://jsonplaceholder.typicode.com/posts/${this.id}`;
    console.log("url getArticleWithArrow", url);
    axios.get(url).then(res => {
      console.log(chalk.red("\n this.id", this.id, "\n"));
      console.log(res.data);
      console.log("this", this);
    });
  }
  async getArticleWithSelf() {
    let url = `https://jsonplaceholder.typicode.com/posts/${this.id}`;
    let self = this;
    console.log("url getArticleWithSelf", url);
    this.article[this.id] = await axios.get(url).then(function(res) {
      console.log(chalk.red("\n self.id", self.id, "\n"));
      console.log(res.data);
      return res.data.body;
    });
    console.log("\n this after getArticleWithSelf", this);
  }
}

let a = new myClass(1);
let b = new myClass(3);
// a.printID();
// a.printID.call(b);
// a.getArticleWithFunction();
// a.getArticleWithArrow();
// a.getArticleWithSelf();
