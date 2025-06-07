interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {



    const response = await fetch(url, options);

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      const errorMessage = `HTTP error! Status: ${response.status}. Details: ${JSON.stringify(errorData)}`;
      console.error("HTTP Response Error:", errorMessage);
      return { success: false, message: errorMessage };
    }

    const data: T = await response.json();
    return { success: true, data };
  } catch (networkError: any) {
    const errorMessage = `Network error: ${networkError.message}`;
    console.error("Fetch Request Error:", errorMessage);
    return { success: false, message: errorMessage };
  }
}