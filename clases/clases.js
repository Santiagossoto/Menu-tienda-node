const readline = require('readline');  // Importar el módulo readline para la entrada/salida de consola
const fs = require('fs');  // Importar el módulo fs para operaciones de sistema de archivos
const path = require('path');
const colors = require('colors');  // Importar el módulo colors para colores en la consola (debes haberlo instalado previamente)
const datosArchivo = require('../datos.json');  // Importar los datos del archivo JSON (ajustar la ruta según la ubicación)

// Define la clase Producto
class Producto {
    constructor(codigoProducto, nombreProducto, inventarioProducto, precioProducto) {
        this.codigoProducto = codigoProducto;
        this.nombreProducto = nombreProducto;
        this.inventarioProducto = inventarioProducto;
        this.precioProducto = precioProducto;
    }
}

// Define la clase ProductosVenta
class ProductosVenta {
    constructor() {
        this.listaProductos = [];  // Inicializar la lista de productos vacía al crear una instancia
    }

    // Método para cargar productos desde datos de archivo
    cargaArchivoProductos() {
        if (datosArchivo && datosArchivo.length > 0) {  // Verificar si hay datos en el archivo
            datosArchivo.forEach(objeto => {  // Iterar sobre cada objeto en el archivo
                let producto = new Producto(
                    objeto.codigoProducto,
                    objeto.nombreProducto,
                    objeto.inventarioProducto,
                    objeto.precioProducto
                );
                this.listaProductos.push(producto);  // Agregar cada producto a la lista de productos
            });
        }
    }

    // Método para imprimir los datos de productos en formato de tabla
    imprimirTablaProductos() {
        console.table(this.listaProductos);  // Mostrar la lista de productos en formato de tabla en la consola
    }

    // Método para agregar un nuevo producto a la lista
    agregarProducto(codigoProducto, nombreProducto, inventarioProducto, precioProducto) {
        const nuevoProducto = new Producto(codigoProducto, nombreProducto, inventarioProducto, precioProducto);
        this.listaProductos.push(nuevoProducto);  // Agregar el nuevo producto a la lista de productos
        console.log("Producto agregado exitosamente".bgGreen);  // Mensaje de éxito al agregar el producto
    }

    // Método para borrar un producto de la lista por su código
    borrarProducto(codigoProducto) {
        const codigo = String(codigoProducto);  // Convertir el código a string para evitar problemas de tipo
        const productoBorrar = this.listaProductos.findIndex(producto => String(producto.codigoProducto) === codigo);
        if (productoBorrar !== -1) {
            this.listaProductos.splice(productoBorrar, 1);  // Eliminar el producto de la lista
            console.log(`Producto con código ${codigo} borrado exitosamente`.bgGreen);  // Mensaje de éxito al borrar el producto
        } else {
            console.log(`Producto con código ${codigo} no encontrado`.bgRed);  // Mensaje de error si el producto no se encuentra
        }
    }


    repararDatos(fileName) {
        try {
            // Lee el contenido del archivo seleccionado usando el nombre del archivo proporcionado.
            const data = fs.readFileSync(fileName, 'utf8');
            
            // Parsea el contenido del archivo JSON para convertirlo en un objeto de JavaScript (en este caso, un array de productos).
            const productos = JSON.parse(data);
            
            // Valida que el contenido del archivo sea un array.
            if (Array.isArray(productos)) {
                // Si es un array, actualiza la lista de productos con los datos del archivo restaurado.
                // Convierte los valores de 'inventarioProducto' y 'precioProducto' a números enteros y flotantes respectivamente.
                this.listaProductos = productos.map(producto => ({
                    codigoProducto: producto.codigoProducto,          // Asigna el código del producto.
                    nombreProducto: producto.nombreProducto,          // Asigna el nombre del producto.
                    inventarioProducto: parseInt(producto.inventarioProducto), // Convierte el inventario a un número entero.
                    precioProducto: parseFloat(producto.precioProducto)        // Convierte el precio a un número decimal.
                }));
                
                // Guarda la lista de productos actualizada en el archivo original.
                this.guardarProductosEnArchivo();
                
                // Muestra un mensaje de éxito en la consola.
                console.log('Datos restaurados correctamente.');
            } else {
                // Si el contenido del archivo no es un array, lanza un error indicando que el formato no es válido.
                throw new Error('El archivo seleccionado no contiene un array válido de productos.');
            }
        } catch (error) {
            // Si ocurre cualquier error (lectura de archivo o procesamiento), lanza un error personalizado con el mensaje correspondiente.
            throw new Error(`Error al restaurar los datos: ${error.message}`);
        }
    }
    
    guardarProductosEnArchivo() {
        try {
            // Convierte la lista de productos en una cadena JSON con formato legible (espaciado de 2).
            const data = JSON.stringify(this.listaProductos, null, 2);
            
            // Guarda los datos en el archivo 'datos.json' usando codificación 'utf8'.
            fs.writeFileSync('datos.json', data, 'utf8');
            
            // Muestra un mensaje de éxito indicando que los datos se guardaron correctamente.
            console.log('Datos guardados exitosamente en datos.json');
        } catch (error) {
            // Si ocurre un error durante el proceso de escritura, lo muestra en la consola.
            console.error('Error al guardar los datos:', error.message);
        }
    }
    
    

    
    

    
        
    
    
    
}

// Define la clase ProductoCarrito
class ProductoCarrito {
    constructor(productosVenta) {
        this.productosVenta = productosVenta;
        this.carrito = [];  // Inicializar el carrito como un arreglo vacío
    }

    // Método para agregar un producto al carrito de compras
    agregarProductoCarrito(codigoProducto, unidades) {
        const producto = this.productosVenta.listaProductos.find(prod => prod.codigoProducto === codigoProducto);  // Buscar el producto en la lista de productos
        if (producto) {
            if (producto.inventarioProducto >= unidades) {
                this.carrito.push({
                    codigoProducto: producto.codigoProducto,
                    nombreProducto: producto.nombreProducto,
                    unidades: unidades,
                    precioTotal: unidades * producto.precioProducto
                });  // Agregar el producto al carrito con su cantidad y precio total
                producto.inventarioProducto -= unidades;  // Actualizar el inventario del producto
                console.log('Producto agregado exitosamente');  // Mensaje de éxito al agregar el producto al carrito
                this.imprimirCarrito();  // Mostrar el contenido actual del carrito
            } else {
                console.log('No hay suficiente inventario para la compra');  // Mensaje si no hay suficiente inventario del producto
            }
        } else {
            console.log('Producto no encontrado');  // Mensaje si el producto no se encuentra en la lista de productos
        }
    }

    // Método para imprimir el contenido actual del carrito
    imprimirCarrito() {
        console.table(this.carrito);  // Mostrar el contenido del carrito en formato de tabla en la consola
    }

    // Método para mostrar el subtotal del carrito (suma de precios totales de los productos en el carrito)
    mostrarSubtotal() {
        const subtotal = this.carrito.reduce((total, item) => total + item.precioTotal, 0);  // Calcular el subtotal sumando los precios totales
        console.log(`Subtotal del carrito: $${subtotal.toFixed(2)}`);  // Mostrar el subtotal formateado
    }
}

// Define la clase CarritoCompra
class CarritoCompra {
    constructor(documento, nombre, direccion, productos = []) {
        this.documento = documento;
        this.nombre = nombre;
        this.direccion = direccion;
        this.productos = productos;  // Inicializar los productos del carrito de compra (opcional)
    }

    // Método para generar una factura basada en los productos del carrito
    generarFactura() {
        console.clear();  // Limpiar la consola antes de generar la factura
        console.log("Generando factura:");

        // Imprimir los detalles de la factura
        console.log('----------------------------');
        console.log(`Documento: ${this.documento}`);
        console.log(`Nombre: ${this.nombre}`);
        console.log(`Dirección: ${this.direccion}`);
        console.log('Productos:');
        console.table(this.productos);  // Mostrar los productos del carrito en formato de tabla
        console.log('----------------------------');

        const totalPagar = this.productos.reduce((total, item) => total + item.precioTotal, 0);  // Calcular el total a pagar sumando los precios totales
        console.log(`Total a pagar: $${totalPagar.toFixed(2)}`);  // Mostrar el total a pagar formateado
        console.log('Gracias por su compra'.bgGreen);  // Mensaje de agradecimiento por la compra
    }
}


// Crear una instancia de la clase ProductosVenta
const tienda = new ProductosVenta();

// Cargar los productos desde el archivo JSON al crear la instancia de ProductosVenta
tienda.cargaArchivoProductos();

// Imprimir los productos en formato de tabla en la consola
tienda.imprimirTablaProductos();

// Exportar las clases para ser utilizadas en otros archivos
module.exports = { ProductosVenta, ProductoCarrito, CarritoCompra };