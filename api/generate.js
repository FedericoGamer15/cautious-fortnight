// Archivo: api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    // Esta variable la configuraremos en el panel de Vercel luego
    const hfToken = process.env.HUGGINGFACE_API_KEY;

    try {
        // Usamos FLUX.1-schnell que es gratuito, rapidísimo y excelente para formas
        const enhancedPrompt = `A high contrast solid black silhouette of ${prompt} on a pure white background. Minimalist vector art style, simple stencil shape, highly recognizable, no shading, no gradients, no borders.`;

        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: {
                    Authorization: `Bearer ${hfToken}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: enhancedPrompt }),
            }
        );

        if (!response.ok) {
            throw new Error(`Error en la IA: ${response.statusText}`);
        }

        // Convertir la imagen que devuelve la IA a formato Base64 para mandarla al HTML
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        // Enviar la imagen de vuelta a tu frontend
        res.status(200).json({ imageUrl: `data:${mimeType};base64,${base64}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
