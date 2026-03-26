let chdmanModule = null;

async function loadChdman() {
    document.getElementById("status").innerText = "Loading converter...";
    chdmanModule = await CHDMAN({
        locateFile: (path) => path
    });
    document.getElementById("status").innerText = "Ready.";
}

window.onload = () => {
    loadChdman();
};

document.getElementById("convertBtn").onclick = async () => {
    const cueFile = document.getElementById("cueInput").files[0];
    const binFile = document.getElementById("binInput").files[0];

    if (!cueFile || !binFile) {
        document.getElementById("status").innerText = "Upload both .cue and .bin.";
        return;
    }

    document.getElementById("status").innerText = "Converting... (may take time)";

    // Load cue + bin into WASM FS
    const cueData = new Uint8Array(await cueFile.arrayBuffer());
    const binData = new Uint8Array(await binFile.arrayBuffer());

    chdmanModule.FS.writeFile("game.cue", cueData);
    chdmanModule.FS.writeFile("game.bin", binData);

    // Run chdman
    try {
        chdmanModule.callMain([
            "createcd",
            "-i", "game.cue",
            "-o", "game.chd"
        ]);
    } catch (e) {
        console.error(e);
        document.getElementById("status").innerText = "Error during conversion.";
        return;
    }

    // Extract output CHD
    const chdData = chdmanModule.FS.readFile("game.chd");

    const blob = new Blob([chdData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = cueFile.name.replace(".cue", ".chd");
    a.click();

    document.getElementById("status").innerText = "Conversion complete!";
};
``
