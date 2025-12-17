let products = [];
let nextId=1;
export default class ProductsDAO{
    getAll(){
        return products;
    }
    getById(id){
        return products.find(product=>product.id === id || null)
    }
    create(data){
        const newProduct={
            id: nextId++, 
            name: data.name,
            price: data.price,
            stock: data.stock?? 0,
            category: data.category ?? 'general'
        }
        products.push(newProduct);
        return newProduct;
        }
    update(id, data){
        const index = products.findIndex(product=>product.id === id)
        if(index===-1){
            return null
        }
        products[index]={...products[index], ...data, id: products[index].id}
        return products[index]
    }
    delete(id){
        const index = products.findIndex(product=>product.id === id)
        if(index===-1){
            return false
        }
        products.splice(index,1);
        return true;
    }
    }
