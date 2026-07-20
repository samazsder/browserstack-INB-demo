'use strict';

/**
 * Logger — beautiful real-time console output with emoji indicators,
 * timestamps, and structured sections for easy debugging.
 */

const COLORS = {
  reset:   '\x1b[0m',
  bright:  '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 23);
}

function pad(str, len = 60) {
  return str.padEnd(len, ' ');
}

const Logger = {
  /** Section divider */
  section(title) {
    const line = '═'.repeat(70);
    console.log(`\n${COLORS.cyan}${COLORS.bright}${line}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}  ${title}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}${line}${COLORS.reset}\n`);
  },

  /** Test suite header */
  suite(name) {
    console.log(`\n${COLORS.blue}${COLORS.bright}📋 SUITE: ${name}${COLORS.reset}`);
    console.log(`${COLORS.gray}   Started: ${timestamp()}${COLORS.reset}\n`);
  },

  /** Individual test start */
  testStart(name) {
    console.log(`${COLORS.white}${COLORS.bright}  ▶ TEST: ${name}${COLORS.reset}`);
    console.log(`${COLORS.gray}    ${timestamp()}${COLORS.reset}`);
  },

  /** Step within a test */
  step(description) {
    console.log(`${COLORS.cyan}    ⚙  ${description}${COLORS.reset}`);
  },

  /** Assertion passed */
  assert(description) {
    console.log(`${COLORS.green}    ✓  ${description}${COLORS.reset}`);
  },

  /** Test passed */
  pass(name, durationMs) {
    const dur = durationMs ? ` (${durationMs}ms)` : '';
    console.log(`${COLORS.green}${COLORS.bright}  ✅ PASS: ${name}${dur}${COLORS.reset}\n`);
  },

  /** Test failed */
  fail(name, error) {
    console.log(`${COLORS.red}${COLORS.bright}  ❌ FAIL: ${name}${COLORS.reset}`);
    if (error) {
      console.log(`${COLORS.red}     Error: ${error.message || error}${COLORS.reset}`);
    }
    console.log('');
  },

  /** Warning */
  warn(msg) {
    console.log(`${COLORS.yellow}  ⚠️  ${msg}${COLORS.reset}`);
  },

  /** Info */
  info(msg) {
    console.log(`${COLORS.blue}  ℹ️  ${msg}${COLORS.reset}`);
  },

  /** Debug (verbose) */
  debug(msg) {
    if (process.env.DEBUG_LOGS === 'true') {
      console.log(`${COLORS.gray}  🔍 ${msg}${COLORS.reset}`);
    }
  },

  /** BrowserStack session link */
  bsSession(sessionId, buildName) {
    console.log(`\n${COLORS.magenta}  🔗 BrowserStack Session: ${sessionId}${COLORS.reset}`);
    if (buildName) {
      console.log(`${COLORS.magenta}  🏗  Build: ${buildName}${COLORS.reset}`);
    }
  },

  /** Percy snapshot taken */
  percy(snapshotName) {
    console.log(`${COLORS.magenta}  📸 Percy snapshot: "${snapshotName}"${COLORS.reset}`);
  },

  /** Summary table */
  summary(results) {
    const line = '─'.repeat(70);
    console.log(`\n${COLORS.bright}${line}${COLORS.reset}`);
    console.log(`${COLORS.bright}  TEST SUMMARY${COLORS.reset}`);
    console.log(`${COLORS.bright}${line}${COLORS.reset}`);

    let passed = 0, failed = 0, skipped = 0;
    results.forEach(r => {
      const icon = r.status === 'pass' ? `${COLORS.green}✅` : r.status === 'skip' ? `${COLORS.yellow}⏭` : `${COLORS.red}❌`;
      console.log(`  ${icon}  ${pad(r.name, 50)} ${r.duration || ''}ms${COLORS.reset}`);
      if (r.status === 'pass') passed++;
      else if (r.status === 'fail') failed++;
      else skipped++;
    });

    console.log(`${COLORS.bright}${line}${COLORS.reset}`);
    console.log(`  ${COLORS.green}Passed: ${passed}${COLORS.reset}  ${COLORS.red}Failed: ${failed}${COLORS.reset}  ${COLORS.yellow}Skipped: ${skipped}${COLORS.reset}`);
    console.log(`${COLORS.bright}${line}${COLORS.reset}\n`);
  },
};

module.exports = Logger;