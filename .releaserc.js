module.exports = {
  branches: [
    'main',
    'v7',
    'next',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true }
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'docs', release: false },
          { type: 'style', release: false },
          { type: 'refactor', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'test', release: false },
          { type: 'chore', release: false },
          { type: 'dependencies', release: 'minor' },
          // dont trigger another release on release commit
          { type: 'release', release: false }
        ]
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Fixes' },
            { type: 'docs', hidden: true },
            { type: 'style', section: 'Style' },
            { type: 'refactor', section: 'Refactor' },
            { type: 'perf', section: 'Performance' },
            { type: 'test', hidden: true },
            { type: 'chore', hidden: true },
            { type: 'dependencies', section: 'Dependencies' },
            { type: 'revert', section: 'Reverts' },
            { type: 'release', hidden: true }
          ]
        }
      }
    ],
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'release: v${nextRelease.version}'
      }
    ],
    '@semantic-release/github'
  ]
}
