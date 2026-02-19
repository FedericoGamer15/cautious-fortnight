export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;

    try {
        // Generamos un prompt ultra-descriptivo para forzar una silueta pura
        const enhancedPrompt = `A high contrast solid black silhouette of ${prompt} on a pure white background. Minimalist vector art style, simple stencil shape, highly recognizable, no shading, no gradients, no borders.`;
        
        // Usamos Pollinations.ai (API gratuita y sin claves)
        const randomSeed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?seed=${randomSeed}&width=400&height=400&nologo=true`;

        // AGREGADO: Disfrazamos la petición para que Cloudflare y Pollinations no bloqueen a Vercel
        // simulando ser un navegador Chrome en una computadora con Windows.
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'image/jpeg, image/png, image/webp, */*',
                'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                'Referer': 'https://pollinations.ai/'
            }
        });

        if (!response.ok) {
            // Mejoramos el manejo de errores para saber exactamente qué falló
            const errorText = await response.text();
            throw new Error(`Error en la IA (${response.status}): ${response.statusText}. Detalles: ${errorText.substring(0, 100)}`);
        }

        // Convertir la imagen descargada a formato Base64
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        // Enviar la imagen de vuelta a tu frontend lista para las hormigas
        res.status(200).json({ imageUrl: `data:${mimeType};base64,${base64}` });

    } catch (error) {
        console.error("Error capturado en el backend:", error);
        res.status(500).json({ error: error.message });
    }
}
