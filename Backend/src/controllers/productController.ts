import { Request, Response } from 'express';
import { Product, ProductDoc } from '../models/productModal';

const createProduct = async (req: any, res: any): Promise<void> => {
    try {
        const { name, price, description } = req.body;
        const product: ProductDoc = new Product({ name, price, description });

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized, Login To Create Product' });
        }


        await product.save();
        res.status(201).json({ product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products: ProductDoc[] = await Product.find();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export{
    createProduct,
    getAllProducts,
}