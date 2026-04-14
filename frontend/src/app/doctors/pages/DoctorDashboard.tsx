import { useNavigate } from "react-router-dom";

//section 1: Data/state

const patientQueue = [
  {name: "Glory Nwosu", id:"SAH-0001", status:"In consultation"},
  {name: "Glory Nwosu", id:"SAH-0001", status:"waiting"},
  {name: "Glory Nwosu", id:"SAH-0001", status:"waiting"}, 
  {name: "Glory Nwosu", id:"SAH-0001", status:"waiting"},
  {name: "Glory Nwosu", id:"SAH-0001", status:"waiting"},
];
const recentConsultations = [
  {name: "Glory Nwosu", id:"SAH-0001", time:"30 mins ago"},
  {name: "Glory Nwosu", id:"SAH-0001", time:"1 hour ago"},
  {name: "Glory Nwosu", id:"SAH-0001", time:"Yesterday"},
  {name: "Glory Nwosu", id:"SAH-0001", time:"2 days ago"},
];
const notifications = [
  {title:"New consultation", time:"10mins ago"},
  {title:"Stock alert", time:"10mins ago"},
  {title:"Medication", time:"10mins ago"},
  {title:"New consultation", time:"10mins ago"},
]
//section 2:MAIN Component
export default function DoctorDashboard(){
  const navigate = useNavigate();

  return(
    <div className = "flex flex-col gap-6 p-6 bg-slate-50 ">
    <h1 className="text-2xl font-bold text-slate-800">Doctor's Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
        {/*greeting banner */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between">
          <div className=" flex flex-col gap-4">
            <div>
              <div>
              <h1 className="text-2xl font-bold text-primary-500">
                Good morning, Dr. Olatunji
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Here's your schedule for today
              </p>
               <button onClick={() => navigate("/consultation")} className="bg-primary-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition w-fit ">Start Consultation</button>
              </div>
              </div>
        </div>

          <div className="flex">
          <img src="/stethoscope.png"
          alt="stethoscope" className="w-32 h-32 object-contain"/>
        </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-slate-800">Report Analysis</h2>
                <select className="text-base font-bold text-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none bg-white"> 
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <p className="text-xs text-slate-400 mb-3">Average number of staffs seen in a week</p>
              <p className="text-2xl font-bold text-primary-500 mb-4">87%</p>
              <p className="text-center text-slate-300 text-sm py-10">Chart Goes Here</p>
            </div>

            {/* Patient Queue section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold-text text-slate-800">Patient Queue</h2>
                <span className="text-orange-500 text-xs cursor-point">Show All</span>
              </div>
              <div>
              <div className="flex flex-col gap-4">
                {patientQueue.map((patient, index) =>(
                  <div key={index} className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center  text-[10px] font-bold text-orange-600">GN</div>
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-[10px] text-slate-400">{patient.id}</p>
                    </div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{patient.status}</span>
                  <button className="bg-orange-500 text-white px-4 py-1 rounded-lg text-xs">Start</button>
                  </div>
                ))}
                </div>
            </div>
            </div>
            <div>
 {/* Recent consultation  Queue section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold-text text-slate-800">consultation Queue</h2>
                <span className="text-orange-500 text-xs cursor-point">Show All</span>
              </div>
              <div>
              <div className="flex flex-col gap-4">
                {recentConsultations.map((recent, index) =>(
                  <div key={index} className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center  text-[10px] font-bold text-orange-600">GN</div>
                    <div>
                      <p className="text-sm font-medium">{recent.name}</p>
                      <p className="text-[10px] text-slate-400">{recent.id}</p>
                    </div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{recent.time}</span>
                  <button className="bg-orange-500 text-white px-4 py-1 rounded-lg text-xs">Start</button>
                  </div>
                ))}

                </div>
                </div>
                </div>
                </div>
                </div>
                <div className="flex flex-col gap-6">

                  {/*Calender placeholder */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Calender</h2>
              <p className="text-center text-slate-300 text-sm py-10"> Calender goes here</p>
            </div>
                 {/*Notification section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-slate-800"> Notfications</h2>
                    <span className="text-orange-500 text-xs cursor-pointer">Show more</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {notifications.map((note, index)=>(
                      <div key={index} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                          {/*Small orange dot icon */}
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <p className="text-sm text-slate-600 font-medium">{note.title}</p>
                        </div>

                        {/*This stays by the right side because of justify-between above */}
                        <p className="text-[10px] text-slate-400">{note.time}</p>
                      </div>
                    ))}
                  </div>
                </div> 
                </div>
                </div>
    </div>
    
  );
}