update product_images set url = 'htpp://localhost:3000/assets/' || url;

SELECT 'htpp://localhost:3000/assets/' || url FROM public.product_images;
