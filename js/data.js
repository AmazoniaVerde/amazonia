/* Datos de respaldo: EJEMPLO. Reemplazar con el catálogo de Supabase. */
const DEMO_CATEGORIES=[
 {id:1,nombre:'Decorativas',descripcion:'Para interiores y exteriores',icon:'🌿'},
 {id:2,nombre:'Carnívoras',descripcion:'Especies curiosas',icon:'🌱'},
 {id:3,nombre:'Exóticas',descripcion:'Únicas y sorprendentes',icon:'🍃'},
 {id:4,nombre:'Orquídeas',descripcion:'Elegancia y color',icon:'🌸'},
 {id:5,nombre:'Suculentas',descripcion:'Fáciles de mantener',icon:'🪴'},
 {id:6,nombre:'Tropicales',descripcion:'Naturaleza en casa',icon:'🌴'}
];
const DEMO_PRODUCTS=[
 {id:1,nombre:'Monstera Deliciosa',tipo:'Decorativas',categoria_id:1,tipo_id:1,descripcion:'Planta tropical de hojas grandes y hermosas, ideal para interiores.',precio:45,stock:12,etiqueta:'Popular',rating:4.8,num_resenas:120,riego:'Moderado',luz:'Luz indirecta',temperatura:'18–28 °C',icon:'🌿'},
 {id:2,nombre:'Venus Atrapamoscas',tipo:'Carnívoras',categoria_id:2,tipo_id:2,descripcion:'Una pequeña cazadora fascinante para tu colección.',precio:35,stock:8,etiqueta:'Nuevo',rating:4.7,num_resenas:90,riego:'Bandeja',luz:'Luz abundante',temperatura:'15–30 °C',icon:'🌱'},
 {id:3,nombre:'Orquídea Morada',tipo:'Orquídeas',categoria_id:4,tipo_id:3,descripcion:'Flores elegantes y duraderas para llenar de color tu espacio.',precio:60,stock:5,etiqueta:'Más vendido',rating:4.9,num_resenas:110,riego:'Cada 7 días',luz:'Luz filtrada',temperatura:'18–26 °C',icon:'🌸'},
 {id:4,nombre:'Calathea Orbifolia',tipo:'Decorativas',categoria_id:1,tipo_id:1,descripcion:'Hojas rayadas que aportan textura y vida.',precio:48,stock:9,etiqueta:'',rating:4.7,num_resenas:70,riego:'Frecuente',luz:'Luz indirecta',temperatura:'18–27 °C',icon:'🍃'},
 {id:5,nombre:'Helecho Boston',tipo:'Decorativas',categoria_id:1,tipo_id:1,descripcion:'Frondoso, fresco y perfecto para espacios luminosos.',precio:40,stock:10,etiqueta:'',rating:4.6,num_resenas:55,riego:'Frecuente',luz:'Luz indirecta',temperatura:'16–25 °C',icon:'🌿'},
 {id:6,nombre:'Sansevieria',tipo:'Suculentas',categoria_id:5,tipo_id:5,descripcion:'Resistente y fácil de cuidar, incluso para principiantes.',precio:35,stock:14,etiqueta:'',rating:4.8,num_resenas:80,riego:'Escaso',luz:'Luz adaptable',temperatura:'15–30 °C',icon:'🌵'},
 {id:7,nombre:'Suculenta Echeveria',tipo:'Suculentas',categoria_id:5,tipo_id:5,descripcion:'Roseta compacta de colores suaves.',precio:30,stock:18,etiqueta:'Oferta',rating:4.8,num_resenas:44,riego:'Escaso',luz:'Luz brillante',temperatura:'15–28 °C',icon:'🪴'},
 {id:8,nombre:'Platycerium',tipo:'Exóticas',categoria_id:3,tipo_id:3,descripcion:'Una pieza especial para amantes de las plantas.',precio:55,stock:4,etiqueta:'',rating:4.6,num_resenas:30,riego:'Moderado',luz:'Luz filtrada',temperatura:'18–28 °C',icon:'🌿'}
];
const CARE_GUIDES=[
 {icon:'💧',title:'¿Cuándo regar?',text:'Revisa la humedad del sustrato antes de volver a regar.'},
 {icon:'☀️',title:'¿Cuánta luz necesitan?',text:'Busca luz natural indirecta para evitar quemaduras.'},
 {icon:'🌱',title:'¿Cómo fertilizar?',text:'Aplica fertilizante cada 2–3 meses en época de crecimiento.'},
 {icon:'✂️',title:'¿Cómo podar?',text:'Retira hojas secas con herramientas limpias.'}
];
