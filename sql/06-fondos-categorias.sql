UPDATE public.categorias
SET imagen_url = 'img/catalogo/dioneas-emperor.jpg'
WHERE lower(nombre) LIKE 'carn%voras';

UPDATE public.categorias
SET imagen_url = 'img/catalogo/monsteras-white-monster.jpg'
WHERE lower(nombre) = 'ornamentales';
