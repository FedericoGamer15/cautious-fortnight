export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    // Vercel tomará automáticamente la clave que guardaste en Environment Variables
    const hfToken = process.env.HUGGINGFACE_API_KEY;

    // Validación extra: Si Vercel no encuentra la clave, avisará inmediatamente
    if (!hfToken) {
        return res.status(500).json({ 
            error: "Falta configurar la variable HUGGINGFACE_API_KEY en Vercel." 
        });
    }

    try {
        // Generamos un prompt ultra-descriptivo para forzar una silueta pura
        const enhancedPrompt = `A high contrast solid black silhouette of ${prompt} on a pure white background. Minimalist vector art style, simple stencil shape, highly recognizable, no shading, no gradients, no borders.`;
        
        // ¡MODELO DEFINITIVO! Usamos Stable Diffusion 2.1 (Siempre abierto, oficial y libre de licencias restrictivas)
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-2-1",
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
            // Intentamos extraer el error exacto que envía Hugging Face para saber qué pasa
            const errorData = await response.json().catch(() => ({}));
            
            // Hugging Face a veces "apaga" los modelos si nadie los usa. Si está despertando, avisamos.
            if (errorData.error && errorData.error.includes("is currently loading")) {
                throw new Error("La IA se está despertando. Por favor, espera 15 segundos y vuelve a intentar.");
            }
            
            throw new Error(`Fallo en Hugging Face: ${errorData.error || response.statusText}`);
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
