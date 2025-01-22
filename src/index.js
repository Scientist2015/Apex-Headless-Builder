const { StaticSiteGenerator } = require('./compiler');

async function main() {
    console.time("⏱️  SSG Build Pipeline Execution");
    
    const compiler = new StaticSiteGenerator();
    await compiler.compileAll();
    
    console.timeEnd("⏱️  SSG Build Pipeline Execution");
}

main().catch(err => {
    console.error("❌ Critical SSG Build Error:", err);
    process.exit(1);
});
