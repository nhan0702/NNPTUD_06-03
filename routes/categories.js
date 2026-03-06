var express = require('express');
var router = express.Router();
let { data, categories } = require('../utils/data')
let slugify = require('slugify')
let { IncrementalId } = require('../utils/IncrementalIdHandler')

// GET all categories with optional name query
///api/v1/categories
router.get('/', function (req, res, next) {
    let nameQ = req.query.name ? req.query.name : '';
    let result = categories.filter(function (e) {
        return (!e.isDeleted) &&
            e.name.toLowerCase().includes(nameQ.toLowerCase())
    })
    res.send(result);
});

// GET category by slug
///api/v1/categories/slug/:slug
router.get('/slug/:slug', function (req, res, next) {
    let slug = req.params.slug;
    let result = categories.find(
        function (e) {
            return (!e.isDeleted) && e.slug == slug;
        }
    )
    if (result) {
        res.status(200).send(result)
    } else {
        res.status(404).send({
            message: "SLUG NOT FOUND"
        })
    }
});

// GET category by ID
///api/v1/categories/:id
router.get('/:id', function (req, res, next) {
    let result = categories.find(
        function (e) {
            return (!e.isDeleted) && e.id == req.params.id
        }
    );
    if (result) {
        res.status(200).send(result)
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        })
    }
});

// GET all products for a specific category
///api/v1/categories/:id/products
router.get('/:id/products', function (req, res, next) {
    let categoryId = parseInt(req.params.id);
    let category = categories.find(
        function (e) {
            return (!e.isDeleted) && e.id == categoryId
        }
    );

    if (!category) {
        return res.status(404).send({
            message: "CATEGORY NOT FOUND"
        })
    }

    let products = data.filter(function (e) {
        return (!e.isDeleted) && e.category.id == categoryId
    })

    res.status(200).send(products);
});

// CREATE new category
///api/v1/categories
router.post('/', function (req, res, next) {
    let newObj = {
        id: IncrementalId(categories),
        name: req.body.name,
        slug: slugify(req.body.name, {
            replacement: '-', lower: true, locale: 'vi',
        }),
        image: req.body.image,
        creationAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
    }
    categories.push(newObj);
    res.status(201).send(newObj);
})

// EDIT/UPDATE category
///api/v1/categories/:id
router.put('/:id', function (req, res, next) {
    let result = categories.find(
        function (e) {
            return e.id == req.params.id
        }
    );
    if (result) {
        let body = req.body;
        let keys = Object.keys(body);
        for (const key of keys) {
            if (result[key]) {
                result[key] = body[key];
            }
        }
        result.updatedAt = new Date(Date.now());
        res.status(200).send(result)
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        })
    }
})

// DELETE category
///api/v1/categories/:id
router.delete('/:id', function (req, res, next) {
    let result = categories.find(
        function (e) {
            return e.id == req.params.id
        }
    );
    if (result) {
        result.isDeleted = true;
        res.status(200).send({
            message: "DELETED SUCCESSFULLY"
        })
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        })
    }
})

module.exports = router;
