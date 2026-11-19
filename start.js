const { spawn, exec } = require('child_process');
const net = require('net');
const path = require('path');

const isPortTaken = (port) => {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => {
      resolve(false);
    });
  });
};

const waitForPort = (port, timeoutMs = 30000) => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      const taken = await isPortTaken(port);
      if (taken) return resolve(true);
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Timeout waiting for port ${port}`));
      }
      setTimeout(check, 300);
    };
    check();
  });
};

async function main() {
  const shouldOpenBrowser = !process.argv.includes('--no-open');
  console.log('Checking CEAMS service ports...');

  const backendRunning = await isPortTaken(5000);
  const frontendRunning = await isPortTaken(5173);

  let backendProc = null;
  let frontendProc = null;

  const backendDir = path.join(__dirname, 'backend');
  const frontendDir = path.join(__dirname, 'frontend');

  const nodemonBin = path.join(backendDir, 'node_modules', 'nodemon', 'bin', 'nodemon.js');
  const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

  if (backendRunning) {
    console.log('Backend API is already running on http://localhost:5000');
  } else {
    console.log('Starting CEAMS Backend Server on port 5000...');
    backendProc = spawn(process.execPath, [nodemonBin, 'server.js'], {
      cwd: backendDir,
      stdio: 'inherit'
    });
  }

  if (frontendRunning) {
    console.log('Frontend dev server is already running on http://localhost:5173');
  } else {
    console.log('Starting CEAMS Frontend Dev Server on port 5173...');
    frontendProc = spawn(process.execPath, [viteBin], {
      cwd: frontendDir,
      stdio: 'inherit'
    });
  }

  try {
    await waitForPort(5173, 25000);
    console.log('\n======================================================');
    console.log('  CEAMS Application is Ready!');
    console.log('  ➜  Local:   http://localhost:5173/');
    console.log('  ➜  API:     http://localhost:5000/api/health');
    console.log('======================================================\n');

    if (shouldOpenBrowser) {
      console.log('Opening http://localhost:5173 in your default browser...');
      const openCmd =
        process.platform === 'win32'
          ? 'start http://localhost:5173'
          : process.platform === 'darwin'
          ? 'open http://localhost:5173'
          : 'xdg-open http://localhost:5173';
      exec(openCmd);
    }
  } catch (err) {
    console.error('Notice:', err.message);
  }

  const cleanup = () => {
    if (backendProc) {
      try { backendProc.kill(); } catch (_) {}
    }
    if (frontendProc) {
      try { frontendProc.kill(); } catch (_) {}
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main();
