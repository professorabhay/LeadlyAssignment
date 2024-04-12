import mongoose, { Document, Schema } from 'mongoose';

interface ProductDoc extends Document {
    name: string;
    price: number;
    description: string;
}

const productSchema = new Schema<ProductDoc>({
    name: { type: String, required: [true, "Please provide the name of product"]},
    price: { type: Number, required: [true, "Please provide the price of product"] },
    description: { type: String, required: [true, "Please provide the description of product"] },
});

const Product = mongoose.model<ProductDoc>('Product', productSchema);

export { Product, ProductDoc };
