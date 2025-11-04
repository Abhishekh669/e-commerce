'use server'

export const getBackEndUrl = async() => {
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // If no environment variable is set, use default
    if (!backendUrl) {
        backendUrl = "http://localhost:8080";
        console.warn("NEXT_PUBLIC_BACKEND_URL not set, using default:", backendUrl);
    }
    
    // Ensure the URL has a protocol
    if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
        backendUrl = `http://${backendUrl}`;
        console.warn("Backend URL missing protocol, added http://:", backendUrl);
    }
    
    // Remove trailing slash if present
    backendUrl = backendUrl.replace(/\/$/, '');
    
    console.log("Backend URL resolved to:", backendUrl);
    return backendUrl;
}

export const getFrontEndUrl = async() => {
    let frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
    
    // If no environment variable is set, use default
    if (!frontendUrl) {
        frontendUrl = "http://localhost:3000";
        console.warn("NEXT_PUBLIC_FRONTEND_URL not set, using default:", frontendUrl);
    }
    
    // Ensure the URL has a protocol
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
        frontendUrl = `http://${frontendUrl}`;
        console.warn("Frontend URL missing protocol, added http://:", frontendUrl);
    }
    
    // Remove trailing slash if present
    frontendUrl = frontendUrl.replace(/\/$/, '');
    
    console.log("Frontend URL resolved to:", frontendUrl);
    return frontendUrl;
}