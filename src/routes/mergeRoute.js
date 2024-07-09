const express = require("express");
const router = express.Router();
const { mergeImages, mergedImages } = require("../controllers/merge");

router.post("/merge-images", mergedImages);

// router.get('/category/getcategory', getCategory)
// router.post("/category/update",upload.array('categoryImage'),updateCategory);
// router.post("/category/delete",deleteCategory);

module.exports = router;
