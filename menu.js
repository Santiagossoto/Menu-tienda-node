const { ProductosVenta, ProductoCarrito, CarritoCompra } = require('./clases/clases.js');  // Importar las clases desde el archivo clases.js
const fs = require('fs');  // Importar el módulo fs para operaciones de sistema de archivos
const readline = require('readline');  // Importar el módulo readline para la entrada/salida de consola
const colors = require('colors');  // Importar el módulo colors para colores en la consola (debes haberlo instalado previamente)

const rl = readline.createInterface({
    input: process.stdin,  // Configurar la entrada estándar para leer desde la consola
    output: process.stdout  // Configurar la salida estándar para escribir en la consola
});

const tienda = new ProductosVenta();  // Crear una instancia de la clase ProductosVenta
tienda.cargaArchivoProductos();  // Cargar los productos desde el archivo al inicializar la tienda

// Inicializar array para almacenar carritos de compra
const carritosCompras = [];
let compras; // Declarar compras como variable global

console.clear(); // Limpiar la consola al inicio del programa

// Función para mostrar el menú principal en la consola
const mostrarMenu = () => {
    console.clear(); // Limpiar la consola antes de mostrar el menú
    console.log("************************".green);
    console.log("***  ".green + "Menú Principal" + "  ***".green);
    console.log("************************".green);
    console.log("1. ".green + "Mostrar productos");  // Opción para mostrar los productos disponibles
    console.log("2. ".green + "Agregar Productos");  // Opción para agregar nuevos productos
    console.log("3. ".green + "Borrar Productos");  // Opción para borrar productos existentes
    console.log("4. ".green + "Copia de respaldo");  // Opción para realizar una copia de respaldo en un archivo JSON
    console.log("5. ".green + "Comprar");  // Opción para realizar una compra
    console.log("6. ".green + "Imprimir facturas");  // Opción para imprimir facturas generadas
    console.log("7. ".green + "Cargar archivo de productos");  // Opción para cargar productos desde un archivo JSON
    console.log("0. ".green + "Salir del programa");  // Opción para salir del programa
    console.log("Elige una opción y presiona Enter:");  // Instrucción para elegir una opción del menú
};

// Función para solicitar datos de un nuevo producto mediante preguntas secuenciales
const pedirDatosProducto = (callback) => {
    rl.question("Ingrese el código del producto: ", (codigoProducto) => {  // Pregunta por el código del producto
        rl.question("Ingrese el nombre del producto: ", (nombreProducto) => {  // Pregunta por el nombre del producto
            rl.question("Ingrese el inventario del producto: ", (inventarioProducto) => {  // Pregunta por el inventario del producto
                rl.question("Ingrese el precio del producto: ", (precioProducto) => {  // Pregunta por el precio del producto
                    callback(codigoProducto, nombreProducto, parseInt(inventarioProducto), parseFloat(precioProducto));  // Llama al callback con los datos ingresados
                });
            });
        });
    });
};

// Función para solicitar el código de un producto a borrar
const pedirCodigoProductoParaBorrar = (callback) => {
    rl.question("Ingrese el código del producto a borrar: ", (codigoProducto) => {  // Pregunta por el código del producto a borrar
        callback(codigoProducto);  // Llama al callback con el código ingresado
    });
};

// Función para solicitar datos de compra al cliente
const pedirDatosCompra = () => {
    console.clear();
    console.log("Comprar producto");
    console.log("\nProductos disponibles:");
    tienda.imprimirTablaProductos();  // Imprime los productos disponibles en la tienda

    rl.question("\nDigite su documento: ", (documento) => {  // Pregunta por el documento del cliente
        console.log(`Documento: ${documento}`);

        rl.question("\nDigite su nombre: ", (nombre) => {  // Pregunta por el nombre del cliente
            console.log(`Nombre: ${nombre}`);

            rl.question("\nDigite su dirección: ", (direccion) => {  // Pregunta por la dirección del cliente
                console.log(`Dirección: ${direccion}`);

                // Crear una instancia de CarritoCompra con los datos del cliente
                const carritoCompra = new CarritoCompra(documento, nombre, direccion);

                // Inicializar la variable compras como una instancia de ProductoCarrito
                compras = new ProductoCarrito(tienda);

                // Función para agregar otro producto al carrito de compra
                const agregarOtroProducto = () => {
                    rl.question("\nIngrese el código del producto que desea comprar: ", (codigoProducto) => {  // Pregunta por el código del producto a comprar
                        rl.question("\nIngrese las unidades que desea comprar: ", (unidades) => {  // Pregunta por las unidades del producto a comprar
                            console.clear();
                            try {
                                compras.agregarProductoCarrito(codigoProducto, parseInt(unidades));  // Agrega el producto al carrito
                                compras.mostrarSubtotal();  // Muestra el subtotal del carrito

                                // Añade el producto al carrito de compra
                                const producto = tienda.listaProductos.find(prod => prod.codigoProducto === codigoProducto);
                                if (producto) {
                                    carritoCompra.productos.push({
                                        codigoProducto: producto.codigoProducto,  // Agrega el código del producto al objeto del carrito de compra
                                        nombreProducto: producto.nombreProducto,  // Agrega el nombre del producto al objeto del carrito de compra
                                        unidades: parseInt(unidades),  // Convierte las unidades a un número entero y las agrega al objeto del carrito de compra
                                        precioTotal: parseInt(unidades) * producto.precioProducto  // Calcula y agrega el precio total (unidades * precio unitario) al objeto del carrito de compra
                                    });
                                }
                            } catch (err) {
                                console.error("Error al agregar producto al carrito:", err);
                            }

                            rl.question("¿Desea agregar otro producto? (SI/NO): ", (respuesta) => {  // Pregunta si desea agregar otro producto al carrito
                                if (respuesta.trim().toLowerCase() === 'si') {
                                    console.clear();
                                    tienda.imprimirTablaProductos();  // Muestra los productos disponibles
                                    agregarOtroProducto();  // Llama recursivamente para agregar otro producto
                                } else {
                                    // Agrega el carrito de compra a la lista de carritosCompras
                                    carritosCompras.push(carritoCompra);

                                    console.log("\nPresiona Enter para volver al menú principal...");
                                    rl.question('', () => {
                                        mostrarMenu();  // Muestra el menú principal después de agregar productos
                                    });
                                }
                            });
                        });
                    });
                };

                agregarOtroProducto();  // Llama a la función para comenzar a agregar productos al carrito
            });
        });
    });
};


const manejarOpcion = (input) => {
    console.clear();  // Limpia la consola antes de mostrar el resultado de la opción elegida
    switch (input.trim()) {  // Inicia un switch basado en la entrada de usuario, eliminando cualquier espacio extra al principio y al final
        case '1':
            console.log("Productos disponibles");  // Muestra un mensaje indicando que se van a mostrar los productos disponibles
            tienda.imprimirTablaProductos();  // Llama al método imprimirTablaProductos() de la instancia tienda para mostrar la lista de productos
            rl.question("\nPresiona Enter para volver al menú principal...", () => {
                mostrarMenu();  // Espera a que el usuario presione Enter para volver al menú principal
            });
            break;


        case '2':
            console.log("Agregar nuevos productos");  // Muestra un mensaje indicando que se va a agregar un nuevo producto
            tienda.imprimirTablaProductos();  // Llama al método imprimirTablaProductos() de la instancia tienda para mostrar la lista de productos
            const agregarProducto = () => {
                pedirDatosProducto((codigoProducto, nombreProducto, inventarioProducto, precioProducto) => {
                    console.clear();  // Limpia la consola antes de mostrar el resultado de agregar el producto
        
                    try {
                        tienda.agregarProducto(codigoProducto, nombreProducto, inventarioProducto, precioProducto);  // Intenta agregar un nuevo producto llamando al método agregarProducto() de la instancia tienda
                        tienda.imprimirTablaProductos();  // Vuelve a mostrar la lista de productos después de agregar el nuevo producto
                        console.log("Producto agregado exitosamente.");  // Muestra un mensaje indicando que el producto se agregó correctamente
                    } catch (err) {
                        console.error("Error al agregar producto:", err);  // Captura y muestra cualquier error que ocurra al agregar el producto
                    }
        
                    rl.question("¿Deseas agregar otro producto? (SI/NO): ", (respuesta) => {
                        if (respuesta.toLowerCase() === 'si') {
                            console.clear();  // Limpia la consola antes de agregar otro producto
                            agregarProducto();  // Vuelve a llamar a la función agregarProducto() si el usuario desea agregar otro producto
                        } else {
                            console.clear();  // Limpia la consola antes de mostrar el menú principal
                            mostrarMenu();  // Muestra el menú principal si el usuario no desea agregar otro producto
                        }
                    });
                });
            };
            agregarProducto();  // Inicia el proceso para agregar un producto
            break;
        

        case '3':
            const borrarProducto = () => {
                console.clear();  // Limpia la consola antes de mostrar el proceso de borrado de productos
                console.log("Borrar productos");  // Muestra un mensaje indicando que se va a borrar un producto
                tienda.imprimirTablaProductos();  // Llama al método imprimirTablaProductos() de la instancia tienda para mostrar la lista de productos antes del borrado
                pedirCodigoProductoParaBorrar((codigoProducto) => {
                    console.clear();  // Limpia la consola antes de procesar el código de producto ingresado por el usuario
        
                    try {
                        tienda.borrarProducto(codigoProducto);  // Intenta borrar el producto utilizando el método borrarProducto() de la instancia tienda
                        tienda.imprimirTablaProductos();  // Vuelve a mostrar la lista de productos después de borrar el producto
                    } catch (err) {
                        console.error("Error al borrar producto:", err);  // Captura y muestra cualquier error que ocurra al intentar borrar el producto
                    }
        
                    rl.question("¿Deseas borrar otro producto? (SI/NO): ", (respuesta) => {
                        if (respuesta.toLowerCase() === 'si') {
                            console.clear();  // Limpia la consola antes de borrar otro producto
                            borrarProducto();  // Vuelve a llamar a la función borrarProducto() si el usuario desea borrar otro producto
                        } else {
                            console.clear();  // Limpia la consola antes de mostrar el menú principal
                            mostrarMenu();  // Muestra el menú principal si el usuario no desea borrar otro producto
                        }
                    });
                });
            };
            borrarProducto();  // Inicia el proceso para borrar un producto
            break;
        

        case '4':
            console.clear();  // Limpia la consola antes de proceder con la opción de guardar productos
            console.log("Productos disponibles");  // Muestra un mensaje indicando que se van a mostrar los productos disponibles
            tienda.imprimirTablaProductos();  // Llama al método imprimirTablaProductos() de la instancia tienda para mostrar la lista de productos disponibles
            rl.question("\n¿Deseas guardar la tabla de productos en un archivo JSON? (SI/NO): ", (respuesta) => {
                if (respuesta.toLowerCase() === 'si') {  // Verifica si el usuario desea guardar los productos en un archivo JSON
                    const fechaActual = new Date();  // Obtiene la fecha y hora actuales
                    const fechaFormateada = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}-${fechaActual.getDate().toString().padStart(2, '0')}_${fechaActual.getHours().toString().padStart(2, '0')}-${fechaActual.getMinutes().toString().padStart(2, '0')}-${fechaActual.getSeconds().toString().padStart(2, '0')}`;  // Formatea la fecha y hora en un formato legible para usar en el nombre del archivo
        
                    const nombreArchivo = `Productos_${fechaFormateada}.json`;  // Define el nombre del archivo JSON utilizando la fecha formateada
                    const productos = tienda.listaProductos;  // Obtiene la lista de productos de la instancia tienda
        
                    fs.writeFile(nombreArchivo, JSON.stringify(productos, null, 2), (err) => {  // Escribe la lista de productos en formato JSON en el archivo
                        if (err) {
                            console.error("Error al guardar archivo:", err);  // Maneja cualquier error que ocurra al intentar guardar el archivo
                        } else {
                            console.log("Productos guardados exitosamente");  // Muestra un mensaje indicando que los productos se han guardado correctamente
                        }
                        rl.question("\nPresiona Enter para volver al menú principal...", () => {
                            mostrarMenu();  // Pregunta al usuario si desea volver al menú principal después de guardar los productos
                        });
                    });
                } else {
                    console.clear();  // Limpia la consola antes de mostrar el menú principal si el usuario no desea guardar productos
                    mostrarMenu();  // Muestra el menú principal
                }
            });
            break;
            

        case '5':
            console.clear();  // Limpia la consola antes de proceder con la opción de compra
            console.log("Comprar producto");  // Muestra un mensaje indicando que se va a proceder con la compra de productos
            compras = new ProductoCarrito(tienda);  // Inicializa la variable compras como una nueva instancia de ProductoCarrito, pasando la instancia tienda como argumento
            pedirDatosCompra();  // Llama a la función pedirDatosCompra() para iniciar el proceso de solicitud de datos para la compra
            break;
            

        case '6':
            console.clear();  // Limpia la consola antes de mostrar las facturas
            console.log("Imprimir facturas");  // Muestra un mensaje indicando que se procederá a imprimir las facturas
        
            // Verificar si hay facturas generadas para imprimir
            if (carritosCompras.length === 0) {
                console.log("No hay facturas disponibles para imprimir");  // Informa al usuario que no hay facturas disponibles
                rl.question("\nPresiona Enter para volver al menú principal...", () => {
                    mostrarMenu();  // Devuelve al menú principal
                });
            } else {
                // Mostrar las facturas disponibles
                console.log("Facturas disponibles:");
                carritosCompras.forEach((carrito, index) => {
                    console.log(`${index + 1}. Documento: ${carrito.documento}, Nombre: ${carrito.nombre}, Dirección: ${carrito.direccion}`);
                });
        
                // Solicitar al usuario que seleccione una factura para imprimir
                rl.question("\nIngrese el número de factura que desea imprimir o '0' para volver al menú principal: ", (respuesta) => {
                    const opcion = parseInt(respuesta);  // Convierte la respuesta del usuario a un número entero
        
                    if (opcion >= 1 && opcion <= carritosCompras.length) {
                        const carritoSeleccionado = carritosCompras[opcion - 1];  // Selecciona el carrito correspondiente
        
                        // Crear una instancia de CarritoCompra y llamar al método generarFactura()
                        const factura = new CarritoCompra(carritoSeleccionado.documento, carritoSeleccionado.nombre, carritoSeleccionado.direccion, carritoSeleccionado.productos);
                        try {
                            factura.generarFactura(compras);  // Genera la factura pasando el objeto compras para calcular el total a pagar
                        } catch (err) {
                            console.error("Error al generar factura:", err);  // Maneja cualquier error que ocurra al generar la factura
                        }
        
                        rl.question("\nPresiona Enter para volver al menú principal...", () => {
                            mostrarMenu();  // Devuelve al menú principal
                        });
                    } else if (opcion === 0) {
                        mostrarMenu();  // Vuelve al menú principal si el usuario elige '0'
                    } else {
                        console.log("Opción inválida. Por favor ingrese un número válido.");  // Informa al usuario si la opción es inválida
                        rl.question('', () => {
                            mostrarMenu();  // Devuelve al menú principal
                        });
                    }
                });
            }
            break;

        case '7':
            // Limpia la consola antes de mostrar el menú de restauración de copia de respaldo.
            console.clear();
            
            // Muestra un título verde en la consola para la opción de restaurar copia de respaldo.
            console.log(''.green);
            console.log(' Restaurar Copia Respaldo '.green);
            console.log(''.green);
        
            // Obtiene la lista de archivos JSON en el directorio actual.
            const jsonFiles = fs.readdirSync('.').filter(file => file.endsWith('.json'));
        
            // Si no se encuentran archivos JSON en el directorio actual, muestra un mensaje en rojo.
            if (jsonFiles.length === 0) {
                console.log('No se encontraron archivos JSON en el directorio actual.'.red);
                
                // Espera a que el usuario presione Enter para volver al menú principal.
                rl.question("\nPresiona Enter para volver al menú principal...", () => {
                    mostrarMenu();
                });
            } else {
                // Si se encontraron archivos JSON, muestra la lista de archivos disponibles.
                console.log('Archivos JSON disponibles:');
                
                // Recorre y muestra cada archivo JSON encontrado con su índice correspondiente.
                jsonFiles.forEach((file, index) => {
                    console.log(`${index + 1}. ${file}`);
                });
        
                // Solicita al usuario que seleccione el archivo que desea cargar por su número.
                rl.question('\nSeleccione el número del archivo que desea cargar: ', (answer) => {
                    // Convierte la respuesta en un número entero y ajusta para índices de array.
                    const fileIndex = parseInt(answer) - 1;
                    
                    // Verifica si el número ingresado es válido y corresponde a un archivo en la lista.
                    if (fileIndex >= 0 && fileIndex < jsonFiles.length) {
                        const selectedFile = jsonFiles[fileIndex];
                        try {
                            // Intenta restaurar los datos desde el archivo seleccionado.
                            tienda.repararDatos(selectedFile);
                            
                            // Informa al usuario que los datos fueron restaurados correctamente.
                            console.log(`Datos restaurados correctamente desde ${selectedFile}.`);
                            
                            // Imprime la tabla actualizada de productos tras restaurar los datos.
                            tienda.imprimirTablaProductos();
                        } catch (error) {
                            // Muestra un mensaje de error si ocurre un problema al restaurar los datos.
                            console.error('Error al restaurar los datos:', error.message);
                        }
                    } else {
                        // Muestra un mensaje en rojo si la selección del archivo es inválida.
                        console.log('Selección inválida.'.red);
                    }
        
                    // Espera a que el usuario presione Enter para volver al menú principal.
                    rl.question("\nPresiona Enter para volver al menú principal...", () => {
                        mostrarMenu();
                    });
                });
            }
        break;

            
                                




            

            case '0':
                console.clear();
                console.log("Guardando cambios antes de salir...");
                try {
                    tienda.guardarProductosEnArchivo();
                    console.log("Cambios guardados exitosamente.");
                } catch (error) {
                    console.error("Error al guardar los cambios:", error.message);
                }
                console.log("Has salido del programa. ¡Hasta luego!");
                rl.close();
            break;
    

            default:
                console.clear();  // Limpia la consola antes de mostrar el mensaje de error
                console.log("Opción no válida. Por favor elige otra");  // Informa al usuario que la opción seleccionada no es válida
                mostrarMenu();  // Muestra nuevamente el menú principal para que el usuario elija otra opción válida
            break;

    }
};

mostrarMenu();  // Llama a la función mostrarMenu() para mostrar el menú principal al inicio del programa

rl.on('line', (input) => {  // Define un evento 'line' para capturar la entrada del usuario
    manejarOpcion(input);  // Llama a la función manejarOpcion(input) para procesar la opción ingresada por el usuario

    if (input.trim() !== '0') {  // Verifica si la entrada del usuario no es '0' (salir del programa)
        rl.question('', () => {  // Pide al usuario una nueva entrada vacía para continuar después de procesar la opción
            mostrarMenu();  // Llama a la función mostrarMenu() para mostrar nuevamente el menú principal
        });

    }
});

rl.on('close', () => {  // Define un evento 'close' que se activa cuando se cierra la interfaz de lectura de la línea de comandos
    console.clear();  // Limpia la consola
    console.log('¡Hasta luego!');  // Muestra un mensaje de despedida
    process.exit(0);  // Termina el proceso de Node.js con código de salida 0 (indicando que la ejecución terminó sin errores)
});

process.on('SIGINT', () => {
    console.log("\nDetectada interrupción. Guardando cambios antes de salir...");
    try {
      tienda.guardarProductosEnArchivo();
      console.log("Cambios guardados exitosamente.");
    } catch (error) {
      console.error("Error al guardar los cambios:", error.message);
    }
    process.exit();
  });

