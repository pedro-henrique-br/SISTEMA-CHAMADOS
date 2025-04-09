import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const formatDate = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR"); // Retorna no formato "dd/mm/aaaa"
};

const formatDateTime = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
};

const excelSaver = (data, fileName) => {
    if (data.length === 0) {
      alert("Não há dados para exportar!");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });

    saveAs(blob, fileName);
}

const isExpired = (dateString) => {
    const createdAt = new Date(dateString);
    const now = new Date();

    // Verifica se passou mais de 24 horas
    return (now.getTime() - createdAt.getTime()) > (24 * 60 * 60 * 1000);
};

const parseDate = (dateStr) => {
    if (typeof dateStr !== "string") {
      console.error("Erro: Data inválida, não é uma string:", dateStr);
      throw new Error("Data inválida, deve ser uma string.");
    }

    if (dateStr.includes("/")) {
      // Formato brasileiro: DD/MM/YYYY HH:mm:ss
      const [datePart, timePart] = dateStr.split(" ");
      if (!datePart || !timePart) {
        console.error("Erro: Data brasileira inválida:", dateStr);
        throw new Error("Formato de data inválido.");
      }

      const [day, month, year] = datePart.split("/").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    if (dateStr.includes("-")) {
      // Formato ISO: YYYY-MM-DD HH:mm:ss
      return new Date(dateStr.replace(" ", "T"));
    }

    console.error("Erro: Formato de data desconhecido:", dateStr);
    throw new Error("Formato de data inválido.");
  }

  const formatElapsedTime = (start, end) => {
    try {
      const startDate = parseDate(start);
      const endDate = parseDate(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Erro: Data inválida após conversão.");
        return "Data inválida";
      }

      const diffMs = endDate.getTime() - startDate.getTime();
      if (diffMs < 0) return "Data inválida";

      const seconds = Math.floor((diffMs / 1000) % 60);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const parts = [];
      if (days > 0) parts.push(`${days} dia${days > 1 ? "s" : ""}`);
      if (hours > 0) parts.push(`${hours} hora${hours > 1 ? "s" : ""}`);
      if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? "s" : ""}`);
      if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? "s" : ""}`);

      return parts.length > 0 ? parts.join(", ") : "Menos de 1 segundo";
    } catch (error) {
      console.error("Erro ao calcular tempo:", error.message);
      return "Erro ao processar as datas.";
    }
  }


export const helpers = {
    formatDate,
    excelSaver,
    formatDateTime,
    isExpired,
    formatElapsedTime
}
