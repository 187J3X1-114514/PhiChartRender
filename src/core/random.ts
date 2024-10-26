export function generateRandomString(length: number): string {
    try {
        return self.crypto.randomUUID().replace("-","").slice(0,length-1)
    } catch {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        return result;
    }
}