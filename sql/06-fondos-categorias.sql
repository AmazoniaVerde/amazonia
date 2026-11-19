UPDATE public.categorias
SET imagen_url = 'img/fondos/venus-carnivora.png'
WHERE lower(nombre) LIKE 'carn%voras';

UPDATE public.categorias
SET imagen_url = 'img/fondos/monstera-ornamental.png'
WHERE lower(nombre) = 'ornamentales';
