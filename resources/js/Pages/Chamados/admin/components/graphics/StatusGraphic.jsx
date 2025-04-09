import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { api } from "../../../utils/api";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const StatusGraphic = () => {
  const [ticketData, setTicketData] = useState([])

  const getPriority = async () => {
    const response = await api.getAllTickets()
    if(response){
      let statusWaiting = 0
      let statusInService = 0
      let statusIdle = 0
      let statusWarning = 0
      const data = await response?.data
      data.forEach((ticket) => {
        switch(ticket.tecnico){
          case null :
            statusWaiting++
            break
          default :
            statusInService++
            break
        }
      const totalPriority = [statusWaiting, statusInService, statusIdle, statusWarning]
      setTicketData(totalPriority)
      })
    }
  }

  useEffect(() => {
    getPriority()
  }, [])


  const data = {
    labels: ["Status"],
    datasets: [
      {
        label: "Em espera",
        data: [ticketData[0]],
        backgroundColor: "#3D933F",
      },
      {
        label: "Em Atendimento",
        data: [ticketData[1]],
        backgroundColor: "#FDA403",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Bar data={data} options={options} style={{ width: "600px", height: "400px" }} />
  )
};

export default StatusGraphic
