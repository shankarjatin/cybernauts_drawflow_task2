const API_URL = "http://localhost:5000"; // Change based on your backend

let editor;
let userRole = "admin"; 

document.addEventListener("DOMContentLoaded", function () {
    editor = new Drawflow(document.getElementById("drawflow"));
    editor.reroute = true;
    editor.reroute_fix_curvature = true;
    editor.start();

    document.getElementById("fetchUserRole").addEventListener("click", fetchUserRole);
    document.getElementById("saveFlowBtn").addEventListener("click", saveFlow);
    document.getElementById("loadFlowBtn").addEventListener("click", loadFlow);
    document.getElementById("exportJsonBtn").addEventListener("click", exportFlow);
});

async function fetchUserRole() {
    const username = document.getElementById("userSelector").value;
    
    try {
        const response = await fetch(`${API_URL}/getRole?user=${username}`);
        const data = await response.json();

        userRole = data.role;
        document.getElementById("module-list").innerHTML = "";

        data.modules.forEach(mod => {
            let div = document.createElement("div");
            div.classList.add("drag-module");
            div.draggable = true;
            div.setAttribute("data-node", mod.type);
            div.innerText = mod.name;
            div.addEventListener("dragstart", drag);
            document.getElementById("module-list").appendChild(div);
        });

        editor.editor_mode = userRole === "admin" ? "edit" : "fixed";

    } catch (error) {
        console.error("Error fetching user role:", error);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("node", ev.target.getAttribute("data-node"));
}

function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("node");
    addNodeToDrawFlow(data, ev.clientX, ev.clientY);
}

function addNodeToDrawFlow(name, pos_x, pos_y) {
    if (editor.editor_mode === "fixed") return false;

    pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
    pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));

    let htmlContent = `<div class="node-box">${name}</div>`;
    editor.addNode(name, 1, 1, pos_x, pos_y, name, {}, htmlContent);
}

async function saveFlow() {
    const flowData = editor.export();

    try {
        await fetch(`${API_URL}/saveFlow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: userRole, flow: flowData })
        });

        alert("Flow saved successfully!");
    } catch (error) {
        console.error("Error saving flow:", error);
    }
}

async function loadFlow() {
    try {
        const response = await fetch(`${API_URL}/loadFlow?user=${userRole}`);
        const data = await response.json();
        editor.import(data.flow);
        alert("Flow loaded successfully!");
    } catch (error) {
        console.error("Error loading flow:", error);
    }
}

function exportFlow() {
    let flowData = editor.export();
    console.log("Exported JSON:", JSON.stringify(flowData, null, 2));
    alert("Flow exported! Check console for JSON output.");
}
