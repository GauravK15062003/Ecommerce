class ApiFeatures{
    constructor(query, queryStr) {  //(Model.find(), ?keyword=samosa)
        this.query = query;
        this.queryStr = queryStr;
    }

    //Search the product using query keyword "http://localhost://products?keyword=samosa"
    search() {
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex: this.queryStr.keyword,
                $options: "i", //case insesitive
            }
        }:{};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    // filter(){
    //     const queryCopy = {...this.queryStr};
    //     // console.log(queryCopy)

    //     //Removing some fields for category from queryStr
    //     const removeFields = ["keyword", "page", "limit"];

    //     removeFields.forEach((key)=>delete queryCopy[key]);

    //     // Filter For Price and Rating
    //     console.log(queryCopy)
    //     let queStr = JSON.stringify(queryCopy);
    //     queStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key)=>`$${key}`);

    //     console.log(queryCopy)

    //     this.query = this.query.find(JSON.parse(queStr));
    //     console.log(queStr);
    //     return this;
    // }

    filter() {
        const queryCopy = { ...this.queryStr };
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Group operators under their field
        let mongoQuery = {};
        Object.keys(queryCopy).forEach((key) => {
            // e.g. price[gte] => field = price, op = gte
            const match = key.match(/^(.+)\[(.+)\]$/);
            if (match) {
                const field = match[1];
                const op = `$${match[2]}`;
                if (!mongoQuery[field]) mongoQuery[field] = {};
                mongoQuery[field][op] = Number(queryCopy[key]);
            } else {
                mongoQuery[key] = queryCopy[key];
            }
        });

        this.query = this.query.find(mongoQuery);
        // console.log(queryStr);
        return this;
    }

    pagination(resultPerPage){ //Products per page
        const currentPage = Number(this.queryStr.page) || 1; // 50 products - 10 products

        const skip = resultPerPage * (currentPage - 1)

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    }
};

module.exports = ApiFeatures;