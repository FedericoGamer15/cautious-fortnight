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

    // Generamos un prompt ultra-descriptivo para forzar una silueta pura
    const enhancedPrompt = `A high contrast solid black silhouette of ${prompt} on a pure white background. Minimalist vector art style, simple stencil shape, highly recognizable, no shading, no gradients, no borders.`;

    // SISTEMA A PRUEBA DE FALLOS: 
    // Lista de los modelos más robustos de Hugging Face. El código probará uno por uno.
    const models = [
        "stabilityai/stable-diffusion-xl-base-1.0", // El rey actual, casi siempre encendido
        "runwayml/stable-diffusion-v1-5",           // El clásico más rápido
        "prompthero/openjourney",                   // Alternativa abierta muy estable
        "CompVis/stable-diffusion-v1-4"             // Respaldo de emergencia
    ];

    let lastError = "No se pudo conectar a ningún modelo";

    // Bucle inteligente: intenta con el primer modelo, si falla, salta al siguiente
    for (const model of models) {
        try {
            const url = `https://router.huggingface.co/hf-inference/models/${model}`;
            
            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${hfToken}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: enhancedPrompt }),
            });

            if (response.ok) {
                // ¡Éxito! Convertimos la imagen y la enviamos a las hormigas
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');
                const mimeType = response.headers.get('content-type') || 'image/jpeg';
                
                return res.status(200).json({ imageUrl: `data:${mimeType};base64,${base64}` });
            } else {
                // Si este modelo falla (Not Found, Cargando, etc.), guardamos el error y continuamos
                const errorData = await response.json().catch(() => ({}));
                lastError = errorData.error || response.statusText;
                console.log(`Fallo silencioso en ${model}: ${lastError}. Intentando el siguiente...`);
            }
        } catch (error) {
            lastError = error.message;
            console.log(`Error de red en ${model}: ${lastError}. Intentando el siguiente...`);
        }
    }

    // Si el bucle termina y absolutamente todos los modelos estaban apagados o saturados:
    console.error("Todos los modelos fallaron. Último error:", lastError);
    return res.status(500).json({ 
        error: `Los servidores gratuitos de IA están saturados en este momento. Intenta en unos minutos.` 
    });
}
