/**
 * Converts an image file to a WebP base64 data URL.
 * 
 * @param {File} file - The image file to convert
 * @param {number} maxWidth - The maximum width of the resulting image (default 500)
 * @param {number} quality - The WebP compression quality (0 to 1, default 0.8)
 * @returns {Promise<string>} A promise that resolves to the base64 data URL
 */
export const convertToWebP = (file, maxWidth = 500, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            return reject(new Error('Invalid image file'));
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Calculate new dimensions maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to webp
                try {
                    const dataUrl = canvas.toDataURL('image/webp', quality);
                    resolve(dataUrl);
                } catch (err) {
                    reject(new Error('Failed to convert image to WebP'));
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = event.target.result;
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};
