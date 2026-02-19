export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;

    try {
        // Generamos un prompt ultra-descriptivo para forzar una silueta pura
        const enhancedPrompt = `A high contrast solid black silhouette of ${prompt} on a pure white background. Minimalist vector art style, simple stencil shape, highly recognizable, no shading, no gradients, no borders.`;
        
        // Usamos Pollinations.ai (API gratuita y sin claves)
        // Añadimos un seed aleatorio para que cada vez que pidas lo mismo, dibuje algo nuevo
        // nologo=true quita la marca de agua para que las hormigas no se distraigan
        const randomSeed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?seed=${randomSeed}&width=400&height=400&nologo=true`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la IA: ${response.statusText}`);
        }

        // Convertir la imagen descargada a formato Base64
        // Esto es CRUCIAL para evitar errores de seguridad (CORS) en el Canvas de tu index.html
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        // Enviar la imagen de vuelta a tu frontend lista para las hormigas
        res.status(200).json({ imageUrl: `data:${mimeType};base64,${base64}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
