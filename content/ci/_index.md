---
title: Status
---

These are the latest results of the Validated Patterns CI test runs.

**NOTE:** Some jobs are currently failing prior to pattern deployment due to [timeouts while deploying OpenShift](https://issues.redhat.com/browse/OCPBUGS-10439).

Subsequent versions of this page will differentiate between failures prior to pattern installation, and those in the pattern tests.

  <script type="text/javascript" src="/js/dashboard.js"></script>

  <div class='results'>
    <p id="ci-dataset"> </p>
    <script>
      obtainBadges({ 'target':'ci-dataset' });
    </script>
  </div>
