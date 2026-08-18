/* =========================================================
   PROCESS SCHEDULING VISUALIZATION SYSTEM

   MODULE 1:
   Intelligent Process Generator

   MODULE 2:
   Adaptive Scheduling Decision Engine

   MODULE 3:
   Interactive Hardware / LED Visualization

   MODULE 4:
   Scheduling Performance Analyzer

   Algorithms:
   FCFS
   SJF
   Round Robin
   Priority Scheduling
========================================================= */


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let processes = [];

let schedule = [];

let currentTime = 0;

let scheduleIndex = 0;

let timer = null;

let simulationRunning = false;

let performanceChart = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

const processTable =
    document.getElementById("processTable");

const algorithmSelect =
    document.getElementById("algorithm");

const quantumInput =
    document.getElementById("quantum");

const speedSelect =
    document.getElementById("speed");

const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const stepButton =
    document.getElementById("stepButton");

const resetButton =
    document.getElementById("resetButton");

const addProcessButton =
    document.getElementById("addProcess");

const generateButton =
    document.getElementById("generateProcesses");

const resetProcessesButton =
    document.getElementById("resetProcesses");


// =========================================================
// PROCESS COLORS
// =========================================================

const colors = [
    "#193f35",
    "#4a401b",
    "#1c3b52",
    "#48263a",
    "#332758",
    "#194047",
    "#493b20",
    "#303552"
];


// =========================================================
// READ PROCESS DATA
// =========================================================

function readProcesses() {

    const rows =
        processTable.querySelectorAll("tr");

    processes = [];

    rows.forEach((row, index) => {

        const arrival =
            Number(
                row.querySelector(".arrival")?.value
            );

        const burst =
            Number(
                row.querySelector(".burst")?.value
            );

        const priority =
            Number(
                row.querySelector(".priority")?.value
            );

        if (
            Number.isNaN(arrival) ||
            Number.isNaN(burst) ||
            Number.isNaN(priority) ||
            burst <= 0
        ) {
            return;
        }

        processes.push({

            id: `P${index + 1}`,

            arrivalTime: arrival,

            burstTime: burst,

            priority: priority,

            completionTime: 0,

            turnaroundTime: 0,

            waitingTime: 0,

            responseTime: 0

        });

    });

    return processes;
}


// =========================================================
// VALIDATE PROCESS DATA
// =========================================================

function validateProcesses() {

    readProcesses();

    if (processes.length === 0) {

        alert(
            "Please enter at least one valid process."
        );

        return false;
    }

    return true;
}


// =========================================================
// FCFS
// =========================================================

function fcfs(list) {

    const sorted =
        [...list].sort((a, b) => {

            if (
                a.arrivalTime !==
                b.arrivalTime
            ) {

                return (
                    a.arrivalTime -
                    b.arrivalTime
                );
            }

            return a.id.localeCompare(b.id);

        });


    const result = [];

    let time = 0;


    for (const process of sorted) {

        if (
            time <
            process.arrivalTime
        ) {

            result.push({

                processId: "IDLE",

                startTime: time,

                endTime:
                    process.arrivalTime

            });

            time =
                process.arrivalTime;
        }


        result.push({

            processId:
                process.id,

            startTime:
                time,

            endTime:
                time +
                process.burstTime

        });


        time +=
            process.burstTime;

    }


    return result;
}


// =========================================================
// SJF - NON PREEMPTIVE
// =========================================================

function sjf(list) {

    const remaining =
        [...list];

    const result = [];

    let time = 0;


    while (
        remaining.length > 0
    ) {

        const available =
            remaining.filter(
                p =>
                    p.arrivalTime <= time
            );


        if (
            available.length === 0
        ) {

            const next =
                Math.min(
                    ...remaining.map(
                        p =>
                            p.arrivalTime
                    )
                );


            result.push({

                processId: "IDLE",

                startTime: time,

                endTime: next

            });


            time = next;

            continue;
        }


        available.sort(
            (a, b) => {

                if (
                    a.burstTime !==
                    b.burstTime
                ) {

                    return (
                        a.burstTime -
                        b.burstTime
                    );
                }

                if (
                    a.arrivalTime !==
                    b.arrivalTime
                ) {

                    return (
                        a.arrivalTime -
                        b.arrivalTime
                    );
                }

                return a.id.localeCompare(
                    b.id
                );

            }
        );


        const selected =
            available[0];


        const index =
            remaining.indexOf(
                selected
            );


        remaining.splice(
            index,
            1
        );


        result.push({

            processId:
                selected.id,

            startTime:
                time,

            endTime:
                time +
                selected.burstTime

        });


        time +=
            selected.burstTime;

    }


    return result;
}


// =========================================================
// PRIORITY SCHEDULING
//
// Lower priority number = higher priority.
// =========================================================

function priorityScheduling(list) {

    const remaining =
        [...list];

    const result = [];

    let time = 0;


    while (
        remaining.length > 0
    ) {

        const available =
            remaining.filter(
                p =>
                    p.arrivalTime <= time
            );


        if (
            available.length === 0
        ) {

            const next =
                Math.min(
                    ...remaining.map(
                        p =>
                            p.arrivalTime
                    )
                );


            result.push({

                processId: "IDLE",

                startTime: time,

                endTime: next

            });


            time = next;

            continue;
        }


        available.sort(
            (a, b) => {

                if (
                    a.priority !==
                    b.priority
                ) {

                    return (
                        a.priority -
                        b.priority
                    );
                }

                if (
                    a.arrivalTime !==
                    b.arrivalTime
                ) {

                    return (
                        a.arrivalTime -
                        b.arrivalTime
                    );
                }

                return a.id.localeCompare(
                    b.id
                );

            }
        );


        const selected =
            available[0];


        const index =
            remaining.indexOf(
                selected
            );


        remaining.splice(
            index,
            1
        );


        result.push({

            processId:
                selected.id,

            startTime:
                time,

            endTime:
                time +
                selected.burstTime

        });


        time +=
            selected.burstTime;

    }


    return result;
}


// =========================================================
// ROUND ROBIN
// =========================================================

function roundRobin(list, quantum) {

    const data =
        [...list]
        .sort(
            (a, b) => {

                if (
                    a.arrivalTime !==
                    b.arrivalTime
                ) {

                    return (
                        a.arrivalTime -
                        b.arrivalTime
                    );
                }

                return a.id.localeCompare(
                    b.id
                );

            }
        )
        .map(
            p => ({

                ...p,

                remaining:
                    p.burstTime

            })
        );


    const queue = [];

    const result = [];

    let time = 0;

    let index = 0;

    let completed = 0;


    while (
        completed <
        data.length
    ) {

        while (
            index <
            data.length &&
            data[index].arrivalTime <=
            time
        ) {

            queue.push(
                data[index]
            );

            index++;

        }


        if (
            queue.length === 0
        ) {

            if (
                index <
                data.length
            ) {

                const next =
                    data[index]
                        .arrivalTime;


                result.push({

                    processId: "IDLE",

                    startTime: time,

                    endTime: next

                });


                time = next;

                continue;
            }
        }


        const process =
            queue.shift();


        const start =
            time;


        const execution =
            Math.min(
                quantum,
                process.remaining
            );


        time += execution;

        process.remaining -=
            execution;


        result.push({

            processId:
                process.id,

            startTime:
                start,

            endTime:
                time

        });


        while (
            index <
            data.length &&
            data[index].arrivalTime <=
            time
        ) {

            queue.push(
                data[index]
            );

            index++;

        }


        if (
            process.remaining > 0
        ) {

            queue.push(
                process
            );

        } else {

            completed++;

        }

    }


    return result;
}


// =========================================================
// GENERATE SELECTED SCHEDULE
// =========================================================

function generateSchedule() {

    if (!validateProcesses()) {
        return false;
    }


    const algorithm =
        algorithmSelect.value;


    if (
        algorithm === "rr"
    ) {

        const quantum =
            Number(
                quantumInput.value
            );


        if (
            quantum <= 0 ||
            Number.isNaN(quantum)
        ) {

            alert(
                "Please enter a valid Time Quantum."
            );

            return false;
        }
    }


    if (
        algorithm === "fcfs"
    ) {

        schedule =
            fcfs(processes);

    }


    else if (
        algorithm === "sjf"
    ) {

        schedule =
            sjf(processes);

    }


    else if (
        algorithm === "rr"
    ) {

        schedule =
            roundRobin(
                processes,
                Number(
                    quantumInput.value
                )
            );

    }


    else if (
        algorithm === "priority"
    ) {

        schedule =
            priorityScheduling(
                processes
            );

    }


    currentTime = 0;

    scheduleIndex = 0;


    calculateMetrics();

    renderGantt();

    renderLEDs();

    updateLEDs();

    updateQueue();

    updateCurrentDisplay();

    compareAllAlgorithms();

    setStatus("READY");


    return true;
}


// =========================================================
// CALCULATE METRICS
// =========================================================

function calculateMetrics() {

    if (
        schedule.length === 0 ||
        processes.length === 0
    ) {
        return;
    }


    const info = {};


    processes.forEach(
        p => {

            info[p.id] = {

                completion: 0,

                firstStart: null

            };

        }
    );


    schedule.forEach(
        block => {

            if (
                block.processId ===
                "IDLE"
            ) {
                return;
            }


            info[
                block.processId
            ].completion =
                block.endTime;


            if (
                info[
                    block.processId
                ].firstStart ===
                null
            ) {

                info[
                    block.processId
                ].firstStart =
                    block.startTime;

            }

        }
    );


    let totalWaiting = 0;

    let totalTurnaround = 0;

    let totalResponse = 0;


    processes.forEach(
        p => {

            const completion =
                info[p.id]
                    .completion;


            const turnaround =
                completion -
                p.arrivalTime;


            const waiting =
                turnaround -
                p.burstTime;


            const response =
                info[p.id]
                    .firstStart -
                p.arrivalTime;


            p.completionTime =
                completion;


            p.turnaroundTime =
                turnaround;


            p.waitingTime =
                waiting;


            p.responseTime =
                response;


            totalWaiting +=
                waiting;


            totalTurnaround +=
                turnaround;


            totalResponse +=
                response;

        }
    );


    const count =
        processes.length;


    const avgWaiting =
        totalWaiting / count;


    const avgTurnaround =
        totalTurnaround / count;


    const lastTime =
        schedule[
            schedule.length - 1
        ].endTime;


    const busyTime =
        processes.reduce(
            (sum, p) =>
                sum +
                p.burstTime,
            0
        );


    const cpuUtilization =
        lastTime > 0
            ? (
                busyTime /
                lastTime
            ) * 100
            : 0;


    const throughput =
        lastTime > 0
            ? count / lastTime
            : 0;


    let contextSwitches = 0;


    for (
        let i = 1;
        i < schedule.length;
        i++
    ) {

        const previous =
            schedule[i - 1]
                .processId;

        const current =
            schedule[i]
                .processId;


        if (
            previous !==
                current &&
            previous !==
                "IDLE" &&
            current !==
                "IDLE"
        ) {

            contextSwitches++;

        }

    }


    document.getElementById(
        "avgWaiting"
    ).textContent =
        avgWaiting.toFixed(2);


    document.getElementById(
        "avgTurnaround"
    ).textContent =
        avgTurnaround.toFixed(2);


    document.getElementById(
        "cpuUtilization"
    ).textContent =
        cpuUtilization.toFixed(2)
        + "%";


    document.getElementById(
        "throughput"
    ).textContent =
        throughput.toFixed(3);


    document.getElementById(
        "contextSwitches"
    ).textContent =
        contextSwitches;


    renderResults();

}


// =========================================================
// PROCESS RESULT TABLE
// =========================================================

function renderResults() {

    const table =
        document.getElementById(
            "resultsTable"
        );


    table.innerHTML = "";


    processes.forEach(
        p => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>${p.id}</strong>
                </td>

                <td>
                    ${p.completionTime}
                </td>

                <td>
                    ${p.turnaroundTime}
                </td>

                <td>
                    ${p.waitingTime}
                </td>

                <td>
                    ${p.responseTime}
                </td>

            `;


            table.appendChild(row);

        }
    );
}


// =========================================================
// GANTT CHART
// =========================================================

function renderGantt() {

    const container =
        document.getElementById(
            "ganttChart"
        );


    container.innerHTML = "";


    if (
        schedule.length === 0
    ) {
        return;
    }


    const totalTime =
        schedule[
            schedule.length - 1
        ].endTime;


    schedule.forEach(
        (block, index) => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "gantt-block";


            div.dataset.index =
                index;


            const duration =
                block.endTime -
                block.startTime;


            const width =
                (
                    duration /
                    totalTime
                ) * 100;


            div.style.flex =
                `0 0 ${width}%`;


            if (
                block.processId ===
                "IDLE"
            ) {

                div.style.background =
                    "#263449";


                div.innerHTML = `

                    IDLE

                    <small>
                        ${block.startTime}
                        –
                        ${block.endTime}
                    </small>

                `;

            }

            else {

                const number =
                    parseInt(
                        block.processId
                            .replace(
                                "P",
                                ""
                            )
                    );


                div.style.background =
                    colors[
                        (
                            number - 1
                        ) %
                        colors.length
                    ];


                div.innerHTML = `

                    ${block.processId}

                    <small>
                        ${block.startTime}
                        –
                        ${block.endTime}
                    </small>

                `;

            }


            container.appendChild(
                div
            );

        }
    );

}


// =========================================================
// LED BOARD
// =========================================================

function renderLEDs() {

    const board =
        document.getElementById(
            "ledBoard"
        );


    board.innerHTML = "";


    processes.forEach(
        p => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "led-card";


            card.innerHTML = `

                <div
                    class="led waiting"
                    id="led-${p.id}">
                </div>

                <strong>
                    ${p.id}
                </strong>

                <span
                    id="led-status-${p.id}">
                    NOT ARRIVED
                </span>

            `;


            board.appendChild(
                card
            );

        }
    );

}


// =========================================================
// UPDATE LED STATES
// =========================================================

function updateLEDs() {

    processes.forEach(
        p => {

            const led =
                document.getElementById(
                    `led-${p.id}`
                );


            const label =
                document.getElementById(
                    `led-status-${p.id}`
                );


            if (
                !led ||
                !label
            ) {
                return;
            }


            led.className =
                "led";


            if (
                currentTime <
                p.arrivalTime
            ) {

                led.classList.add(
                    "waiting"
                );

                label.textContent =
                    "NOT ARRIVED";

                return;
            }


            if (
                p.completionTime > 0 &&
                currentTime >=
                p.completionTime
            ) {

                led.classList.add(
                    "completed"
                );

                label.textContent =
                    "COMPLETED";

                return;
            }


            const running =
                schedule.find(
                    block =>

                        block.processId ===
                            p.id &&

                        currentTime >=
                            block.startTime &&

                        currentTime <
                            block.endTime

                );


            if (running) {

                led.classList.add(
                    "running"
                );

                label.textContent =
                    "RUNNING";

            }

            else {

                led.classList.add(
                    "ready"
                );

                label.textContent =
                    "READY";

            }

        }
    );

}


// =========================================================
// READY QUEUE
// =========================================================

function updateQueue() {

    const queue =
        document.getElementById(
            "readyQueue"
        );


    queue.innerHTML = "";


    const runningBlock =
        schedule.find(
            block =>

                currentTime >=
                    block.startTime &&

                currentTime <
                    block.endTime

        );


    const running =
        runningBlock
            ? runningBlock.processId
            : null;


    const ready =
        processes.filter(
            p =>

                p.arrivalTime <=
                    currentTime &&

                p.completionTime >
                    currentTime &&

                p.id !==
                    running

        );


    if (
        ready.length === 0
    ) {

        const empty =
            document.createElement(
                "span"
            );


        empty.textContent =
            "Queue is empty";


        empty.style.color =
            "#64748b";


        queue.appendChild(
            empty
        );


        return;
    }


    ready.forEach(
        p => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "queue-item";


            item.textContent =
                p.id;


            queue.appendChild(
                item
            );

        }
    );

}


// =========================================================
// CURRENT CPU DISPLAY
// =========================================================

function updateCurrentDisplay() {

    const block =
        schedule.find(
            b =>

                currentTime >=
                    b.startTime &&

                currentTime <
                    b.endTime

        );


    document.getElementById(
        "currentProcess"
    ).textContent =
        block
            ? block.processId
            : "—";


    document.getElementById(
        "currentTime"
    ).textContent =
        currentTime;


    const names = {

        fcfs:
            "FCFS",

        sjf:
            "SJF",

        rr:
            "ROUND ROBIN",

        priority:
            "PRIORITY"

    };


    document.getElementById(
        "selectedAlgorithm"
    ).textContent =
        names[
            algorithmSelect.value
        ];

}


// =========================================================
// ANIMATION
// =========================================================

function stepSimulation() {

    if (
        schedule.length === 0
    ) {

        if (
            !generateSchedule()
        ) {
            return;
        }

    }


    if (
        scheduleIndex >=
        schedule.length
    ) {

        finishSimulation();

        return;
    }


    const block =
        schedule[
            scheduleIndex
        ];


    currentTime =
        block.startTime;


    updateCurrentDisplay();

    updateLEDs();

    updateQueue();

    highlightGantt(
        scheduleIndex
    );


    currentTime =
        block.endTime;


    scheduleIndex++;


    updateCurrentDisplay();

    updateLEDs();

    updateQueue();


    if (
        scheduleIndex >=
        schedule.length
    ) {

        finishSimulation();

    }

}


// =========================================================
// START SIMULATION
// =========================================================

function startSimulation() {

    if (
        schedule.length === 0
    ) {

        if (
            !generateSchedule()
        ) {
            return;
        }

    }


    if (
        scheduleIndex >=
        schedule.length
    ) {

        scheduleIndex = 0;

        currentTime = 0;

    }


    simulationRunning = true;


    setStatus(
        "RUNNING"
    );


    clearInterval(timer);


    timer =
        setInterval(
            stepSimulation,
            Number(
                speedSelect.value
            )
        );

}


// =========================================================
// PAUSE
// =========================================================

function pauseSimulation() {

    clearInterval(timer);

    timer = null;

    simulationRunning = false;

    setStatus(
        "PAUSED"
    );

}


// =========================================================
// FINISH
// =========================================================

function finishSimulation() {

    clearInterval(timer);

    timer = null;

    simulationRunning = false;

    currentTime =
        schedule.length > 0
            ? schedule[
                schedule.length - 1
              ].endTime
            : 0;


    updateCurrentDisplay();

    updateLEDs();

    updateQueue();

    highlightGantt(-1);

    setStatus(
        "COMPLETED"
    );

}


// =========================================================
// HIGHLIGHT GANTT BLOCK
// =========================================================

function highlightGantt(index) {

    const blocks =
        document.querySelectorAll(
            ".gantt-block"
        );


    blocks.forEach(
        (block, i) => {

            block.classList.toggle(
                "active",
                i === index
            );

        }
    );

}


// =========================================================
// RESET SIMULATION
// =========================================================

function resetSimulation() {

    clearInterval(timer);

    timer = null;

    simulationRunning = false;

    currentTime = 0;

    scheduleIndex = 0;

    schedule = [];


    readProcesses();


    processes.forEach(
        p => {

            p.completionTime = 0;

            p.turnaroundTime = 0;

            p.waitingTime = 0;

            p.responseTime = 0;

        }
    );


    document.getElementById(
        "avgWaiting"
    ).textContent =
        "0.00";


    document.getElementById(
        "avgTurnaround"
    ).textContent =
        "0.00";


    document.getElementById(
        "cpuUtilization"
    ).textContent =
        "0%";


    document.getElementById(
        "throughput"
    ).textContent =
        "0";


    document.getElementById(
        "contextSwitches"
    ).textContent =
        "0";


    document.getElementById(
        "bestAlgorithm"
    ).textContent =
        "—";


    document.getElementById(
        "resultsTable"
    ).innerHTML = "";


    document.getElementById(
        "comparisonTable"
    ).innerHTML = "";


    document.getElementById(
        "ganttChart"
    ).innerHTML = "";


    renderLEDs();

    updateLEDs();

    updateQueue();

    updateCurrentDisplay();

    setStatus(
        "READY"
    );

}


// =========================================================
// ADD PROCESS
// =========================================================

function addProcess() {

    const rows =
        processTable.querySelectorAll(
            "tr"
        );


    if (
        rows.length >= 8
    ) {

        alert(
            "Maximum 8 processes allowed."
        );

        return;
    }


    const number =
        rows.length + 1;


    const row =
        document.createElement(
            "tr"
        );


    row.innerHTML = `

        <td>
            <span class="pid p${(
                number - 1
            ) % 4 + 1}">
                P${number}
            </span>
        </td>

        <td>
            <input
                class="arrival"
                type="number"
                value="${number}"
                min="0">
        </td>

        <td>
            <input
                class="burst"
                type="number"
                value="${
                    Math.floor(
                        Math.random() * 6
                    ) + 2
                }"
                min="1">
        </td>

        <td>
            <input
                class="priority"
                type="number"
                value="${
                    Math.floor(
                        Math.random() * 4
                    ) + 1
                }"
                min="1">
        </td>

        <td>
            <button class="delete-button">
                ×
            </button>
        </td>

    `;


    processTable.appendChild(
        row
    );


    renderLEDs();

}


// =========================================================
// DELETE PROCESS
// =========================================================

function deleteProcess(button) {

    const row =
        button.closest("tr");


    if (!row) {
        return;
    }


    row.remove();

    renumberProcesses();

    renderLEDs();

}


// =========================================================
// RENUMBER PROCESSES
// =========================================================

function renumberProcesses() {

    const rows =
        processTable.querySelectorAll(
            "tr"
        );


    rows.forEach(
        (row, index) => {

            const pid =
                row.querySelector(
                    ".pid"
                );


            if (pid) {

                pid.textContent =
                    `P${index + 1}`;

            }

        }
    );

}


// =========================================================
// RANDOM PROCESS GENERATOR
// =========================================================

function generateRandomProcesses() {

    const rows =
        processTable.querySelectorAll(
            "tr"
        );


    rows.forEach(
        (row, index) => {

            const arrival =
                row.querySelector(
                    ".arrival"
                );


            const burst =
                row.querySelector(
                    ".burst"
                );


            const priority =
                row.querySelector(
                    ".priority"
                );


            arrival.value =
                index === 0
                    ? 0
                    : Math.floor(
                        Math.random() * 6
                    );


            burst.value =
                Math.floor(
                    Math.random() * 8
                ) + 2;


            priority.value =
                Math.floor(
                    Math.random() * 4
                ) + 1;

        }
    );


    renderLEDs();

    resetSimulation();

}


// =========================================================
// RESET EXAMPLE DATA
// =========================================================

function resetExample() {

    processTable.innerHTML = `

        <tr>

            <td>
                <span class="pid p1">
                    P1
                </span>
            </td>

            <td>
                <input
                    class="arrival"
                    type="number"
                    value="0"
                    min="0">
            </td>

            <td>
                <input
                    class="burst"
                    type="number"
                    value="5"
                    min="1">
            </td>

            <td>
                <input
                    class="priority"
                    type="number"
                    value="2"
                    min="1">
            </td>

            <td>
                <button class="delete-button">
                    ×
                </button>
            </td>

        </tr>


        <tr>

            <td>
                <span class="pid p2">
                    P2
                </span>
            </td>

            <td>
                <input
                    class="arrival"
                    type="number"
                    value="1"
                    min="0">
            </td>

            <td>
                <input
                    class="burst"
                    type="number"
                    value="3"
                    min="1">
            </td>

            <td>
                <input
                    class="priority"
                    type="number"
                    value="1"
                    min="1">
            </td>

            <td>
                <button class="delete-button">
                    ×
                </button>
            </td>

        </tr>


        <tr>

            <td>
                <span class="pid p3">
                    P3
                </span>
            </td>

            <td>
                <input
                    class="arrival"
                    type="number"
                    value="2"
                    min="0">
            </td>

            <td>
                <input
                    class="burst"
                    type="number"
                    value="4"
                    min="1">
            </td>

            <td>
                <input
                    class="priority"
                    type="number"
                    value="3"
                    min="1">
            </td>

            <td>
                <button class="delete-button">
                    ×
                </button>
            </td>

        </tr>


        <tr>

            <td>
                <span class="pid p4">
                    P4
                </span>
            </td>

            <td>
                <input
                    class="arrival"
                    type="number"
                    value="3"
                    min="0">
            </td>

            <td>
                <input
                    class="burst"
                    type="number"
                    value="2"
                    min="1">
            </td>

            <td>
                <input
                    class="priority"
                    type="number"
                    value="2"
                    min="1">
            </td>

            <td>
                <button class="delete-button">
                    ×
                </button>
            </td>

        </tr>

    `;


    resetSimulation();

}


// =========================================================
// COMPARE ALL FOUR ALGORITHMS
// =========================================================

function compareAllAlgorithms() {

    if (!validateProcesses()) {
        return;
    }


    const algorithms = [

        {
            name: "FCFS",
            value: "fcfs"
        },

        {
            name: "SJF",
            value: "sjf"
        },

        {
            name: "Round Robin",
            value: "rr"
        },

        {
            name: "Priority",
            value: "priority"
        }

    ];


    const results = [];


    algorithms.forEach(
        algorithm => {

            let result;


            if (
                algorithm.value ===
                "fcfs"
            ) {

                result =
                    fcfs(processes);

            }

            else if (
                algorithm.value ===
                "sjf"
            ) {

                result =
                    sjf(processes);

            }

            else if (
                algorithm.value ===
                "rr"
            ) {

                result =
                    roundRobin(
                        processes,
                        Number(
                            quantumInput.value
                        ) || 2
                    );

            }

            else {

                result =
                    priorityScheduling(
                        processes
                    );

            }


            const metrics =
                calculateScheduleMetrics(
                    result
                );


            results.push({

                name:
                    algorithm.name,

                waiting:
                    metrics.avgWaiting,

                turnaround:
                    metrics.avgTurnaround,

                utilization:
                    metrics.cpuUtilization

            });

        }
    );


    renderComparisonTable(
        results
    );


    renderPerformanceChart(
        results
    );


    identifyBestAlgorithm(
        results
    );

}


// =========================================================
// CALCULATE METRICS FOR ONE SCHEDULE
// =========================================================

function calculateScheduleMetrics(result) {

    const info = {};


    processes.forEach(
        p => {

            info[p.id] = {

                completion: 0,

                firstStart: null

            };

        }
    );


    result.forEach(
        block => {

            if (
                block.processId ===
                "IDLE"
            ) {
                return;
            }


            info[
                block.processId
            ].completion =
                block.endTime;


            if (
                info[
                    block.processId
                ].firstStart ===
                null
            ) {

                info[
                    block.processId
                ].firstStart =
                    block.startTime;

            }

        }
    );


    let totalWaiting = 0;

    let totalTurnaround = 0;


    processes.forEach(
        p => {

            const completion =
                info[p.id]
                    .completion;


            const turnaround =
                completion -
                p.arrivalTime;


            const waiting =
                turnaround -
                p.burstTime;


            totalWaiting +=
                waiting;


            totalTurnaround +=
                turnaround;

        }
    );


    const count =
        processes.length;


    const lastTime =
        result.length > 0
            ? result[
                result.length - 1
              ].endTime
            : 0;


    const burstTotal =
        processes.reduce(
            (sum, p) =>
                sum +
                p.burstTime,
            0
        );


    const utilization =
        lastTime > 0
            ? (
                burstTotal /
                lastTime
            ) * 100
            : 0;


    return {

        avgWaiting:
            totalWaiting / count,

        avgTurnaround:
            totalTurnaround / count,

        cpuUtilization:
            utilization

    };

}


// =========================================================
// COMPARISON TABLE
// =========================================================

function renderComparisonTable(
    results
) {

    const table =
        document.getElementById(
            "comparisonTable"
        );


    table.innerHTML = "";


    results.forEach(
        result => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${result.name}
                    </strong>
                </td>

                <td>
                    ${result.waiting.toFixed(2)}
                </td>

                <td>
                    ${result.turnaround.toFixed(2)}
                </td>

                <td>
                    ${result.utilization.toFixed(2)}%
                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}


// =========================================================
// PERFORMANCE GRAPH
// =========================================================

function renderPerformanceChart(
    results
) {

    const canvas =
        document.getElementById(
            "performanceChart"
        );


    if (
        performanceChart
    ) {

        performanceChart.destroy();

    }


    performanceChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        results.map(
                            r =>
                                r.name
                        ),

                    datasets: [

                        {

                            label:
                                "Average Waiting Time",

                            data:
                                results.map(
                                    r =>
                                        Number(
                                            r.waiting.toFixed(
                                                2
                                            )
                                        )
                                )

                        },

                        {

                            label:
                                "Average Turnaround Time",

                            data:
                                results.map(
                                    r =>
                                        Number(
                                            r.turnaround.toFixed(
                                                2
                                            )
                                        )
                                )

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            title: {

                                display:
                                    true,

                                text:
                                    "Time"

                            }

                        },

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Scheduling Algorithm"

                            }

                        }

                    },

                    plugins: {

                        legend: {

                            display:
                                true

                        },

                        title: {

                            display:
                                true,

                            text:
                                "CPU Scheduling Performance Comparison"

                        }

                    }

                }

            }
        );

}


// =========================================================
// IDENTIFY MOST EFFICIENT ALGORITHM
//
// Lower average waiting time is the primary criterion.
// Turnaround time is used as a tie breaker.
// =========================================================

function identifyBestAlgorithm(
    results
) {

    if (
        results.length === 0
    ) {
        return;
    }


    const sorted =
        [...results].sort(
            (a, b) => {

                if (
                    a.waiting !==
                    b.waiting
                ) {

                    return (
                        a.waiting -
                        b.waiting
                    );

                }

                return (
                    a.turnaround -
                    b.turnaround
                );

            }
        );


    const best =
        sorted[0];


    document.getElementById(
        "bestAlgorithm"
    ).textContent =
        best.name;

}


// =========================================================
// STATUS
// =========================================================

function setStatus(
    status
) {

    document.getElementById(
        "systemStatus"
    ).textContent =
        status;

}


// =========================================================
// EVENT LISTENERS
// =========================================================

startButton.addEventListener(
    "click",
    startSimulation
);


pauseButton.addEventListener(
    "click",
    pauseSimulation
);


stepButton.addEventListener(
    "click",
    () => {

        if (
            schedule.length === 0
        ) {

            if (
                !generateSchedule()
            ) {
                return;
            }

        }


        stepSimulation();

    }
);


resetButton.addEventListener(
    "click",
    resetSimulation
);


addProcessButton.addEventListener(
    "click",
    addProcess
);


generateButton.addEventListener(
    "click",
    generateRandomProcesses
);


resetProcessesButton.addEventListener(
    "click",
    resetExample
);


algorithmSelect.addEventListener(
    "change",
    () => {

        generateSchedule();

    }
);


quantumInput.addEventListener(
    "change",
    () => {

        if (
            algorithmSelect.value ===
            "rr"
        ) {

            generateSchedule();

        }

    }
);


// =========================================================
// DELETE BUTTON EVENT DELEGATION
// =========================================================

processTable.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "delete-button"
            )
        ) {

            deleteProcess(
                event.target
            );

        }

    }
);


// =========================================================
// INITIALIZE
// =========================================================

window.addEventListener(
    "load",
    () => {

        readProcesses();

        renderLEDs();

        updateLEDs();

        updateQueue();

        updateCurrentDisplay();

        setStatus(
            "READY"
        );

        generateSchedule();

    }
);
