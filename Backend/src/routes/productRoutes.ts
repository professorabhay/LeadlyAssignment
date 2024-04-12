import { getAllProducts, createProduct } from "../controllers/productController";
import {Router} from "express";
import { verifyJWT } from "../middleware/authMiddleware";

const prouter = Router()

prouter.route("/create-product").post(verifyJWT ,createProduct);
prouter.route("/get-products").get(getAllProducts);

export default prouter;