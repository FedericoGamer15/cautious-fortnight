export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    // Vercel tomará automáticamente la clave que guardaste en Environment Variables
    const hfToken = process.env.HUGGINGFACE_API_KEY;

    try {
        // Generamos un prompt ultra-descriptivo para forzar una silueta pura
        const enhancedPrompt = `A high contrast solid black silhouette of ${prompt} on a pure white background. Minimalist vector art style, simple stencil shape, highly recognizable, no shading, no gradients, no borders.`;
        
        // Usamos Stable Diffusion v1.5, el modelo gratuito más estable y permanente de Hugging Face
        const response = await fetch(
            "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
            {
                headers: {
                    "Authorization": `Bearer ${hfToken}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: enhancedPrompt }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face Error (${response.status}): ${errorText.substring(0, 150)}`);
        }

        // Convertir la imagen descargada a formato Base64 para mandarla al frontend
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        // Enviar la imagen de vuelta a tu página web lista para las hormigas
        res.status(200).json({ imageUrl: `data:${mimeType};base64,${base64}` });

    } catch (error) {
        console.error("Error capturado en el backend:", error);
        res.status(500).json({ error: error.message });
    }
}
