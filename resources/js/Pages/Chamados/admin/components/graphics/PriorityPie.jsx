import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { api } from "../../../utils/api";
import { Typography } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend);

const PriorityPie = () => {
  const [ticketData, setTicketData] = useState([])

  const getPriority = async () => {
    const response = await api.getAllTickets()
    if(response){
      let priorityLow = 0
      let priorityModerate = 0
      let priorityHigh = 0
      let priorityWarning = 0
      response.data.forEach((ticket) => {
        switch(ticket.prioridade){
          case "Crítica" :
            priorityWarning++
            break
          case "Alta" :
            priorityHigh++
            break
          case "Média" :
            priorityModerate++
            break
          case "Baixa" :
            priorityLow++
            break
        }
      const totalPriority = [priorityLow, priorityModerate, priorityHigh, priorityWarning]
      setTicketData(totalPriority)
      })
    }
  }

  useEffect(() => {
    getPriority()
  }, [])

  const data = {
    labels: ["Baixa", "Média", "Alta", "Crítica"],
    datasets: [
      {
        data: ticketData,
        backgroundColor: ["#3D933F", "rgb(2, 136, 209)", "rgb(237, 108, 2)",  "rgb(211, 47, 47)"],
        hoverBackgroundColor: ["#3D933F", "rgb(2, 136, 209)", "rgb(237, 108, 2)", "rgb(211, 47, 47)"],
      },
    ],
  };

  return (
    <>
      {ticketData.length > 0 && data.datasets[0].data.length > 0 ?(
        <Pie data={data} />
      )
      :
      (
        <Typography>Nenhum Chamado Aberto</Typography>
      )
    }
    </>
  )
};

export default PriorityPie
