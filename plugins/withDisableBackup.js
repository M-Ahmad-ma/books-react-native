const { withAndroidManifest } = require('@expo/config-plugins')

function withDisableBackup(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults
    const application = manifest['manifest']['application']?.[0]
    if (application) {
      application.$['android:allowBackup'] = 'false'
    }
    return config
  })
}

module.exports = withDisableBackup
