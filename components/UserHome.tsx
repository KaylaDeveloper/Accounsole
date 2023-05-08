import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

export default function UserHome(props: {
  months: {
    month: string;
    fromDate: string;
    toDate: string;
  }[];
  monthlyExpenses: number[];
  monthlyIncome: number[];
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const expenseOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Monthly Expenses",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const incomeOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Monthly Income",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const labels = props.months.map((m) =>
    new Date(m.fromDate).toLocaleString("default", {
      month: "long",
      year: "numeric",
    })
  );

  const expenseData = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: props.monthlyExpenses,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const incomeData = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: props.monthlyIncome,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const notifications = [
    `Your July - September quarterly BAS is due on 28th October`,

    `Your October - December quarterly BAS is due on 28th february`,

    `Your January - March quarterly BAS is due on 28th April`,

    `Your April - June quarterly BAS is due on 28th July`,

    `Your Income Tax Return is due on 31th October`,
  ];

  const [currentNotification, setCurrentNotification] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % (notifications.length + 1));
    }, 2000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  return (
    <div className="p-10 flex flex-col justify-center w-full gap-10">
      <div className="hidden sm:flex gap-10 items-baseline h-8 overflow-hidden bg-slate-200 w-full">
        <h1 className="text-xl ml-2">Notifications:</h1>
        <div
          style={{
            transform: `translateY(-${currentNotification * 28}px)`,
            transition: "transform 1s ease-in-out",
            opacity: `${currentNotification === 0 ? 0 : 1}`,
          }}
        >
          <p className="text-lg opacity-0">{notifications[0]}</p>
          <p className="text-lg ">{notifications[0]}</p>
          <p className="text-lg ">{notifications[1]}</p>
          <p className="text-lg ">{notifications[2]}</p>
          <p className="text-lg ">{notifications[3]}</p>
          <p className="text-lg ">{notifications[4]}</p>
        </div>
      </div>
      <div className="flex flex-col w-full gap-8 sm:flex-row">
        <div className="w-full">
          <Line options={incomeOptions} data={incomeData} />
        </div>
        <div className="w-full">
          <Line options={expenseOptions} data={expenseData} />
        </div>
      </div>
    </div>
  );
}
