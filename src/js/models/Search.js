import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
            //const res = await fetch(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
            this.result = res.data.recipes
            //console.log(this.result);
        } catch (error) {
            console.log(error);
        }
    };
}


//const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`); //in Recipe.js