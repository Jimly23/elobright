import api from "@/src/lib/axios";

export const audioTelemetryService = {
  store: async (data: any) => {
    const response = await api.post("/audio-telemetry", data);
    return response.data;
  },
};
