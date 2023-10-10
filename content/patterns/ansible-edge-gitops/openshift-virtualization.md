---
title: OpenShift Virtualization
weight: 50
aliases: /ansible-edge-gitops/openshift-virtualization/
---

# OpenShift Virtualization

# Understanding the Edge GitOps VMs [Helm Chart](https://github.com/validatedpatterns/ansible-edge-gitops/tree/main/charts/hub/edge-gitops-vms)

The heart of the Edge GitOps VMs helm chart is a [template file](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/charts/hub/edge-gitops-vms/templates/virtual-machines.yaml) that was designed with a fair amount of flexibility in mind. Specifically, it allows you to specify:

1. One or more "groups" of VMs (such as "kiosk" in our example) with an arbitrary number of instances per group
1. Different sizing parameters (cores, threads, memory, disk size) for each group
1. Different SSH keypair credentials for each group
1. Different OS's for each group
1. Different sets of TCP and/or UDP ports open for each group

This is to allow you to set up, for example, 4 VMs of one type, 3 VMs of another, and 2 VMs of a third type. This will hopefully abstract the details of VM creation through OpenShift Virtualization and allow you to focus on what kinds and how many of the different sorts of VMs you might need to set up.  (Note that AWS's smallest metal node is 72 cores and 192 GB of RAM at initial release, so there is plenty of room for different combinations/configurations.)

## How we got here - Default OpenShift Virtualization templates

OpenShift virtualization expects to install virtual machines from image templates by default, and provides a number of OpenShift templates to facilitate this. The default templates are installed in the `openshift` namespace; the OpenShift console also provides a wizard for creating VMs that use the same templates.

As of OpenShift Virtualization 4.10.1, the following templates were available on installation:

```text
$ oc get template

NAME                                            DESCRIPTION                                                                        PARAMETERS        OBJECTS
3scale-gateway                                  3scale's APIcast is an NGINX based API gateway used to integrate your interna...   17 (8 blank)      3
amq63-basic                                     Application template for JBoss A-MQ brokers. These can be deployed as standal...   11 (4 blank)      6
amq63-persistent                                An example JBoss A-MQ application. For more information about using this temp...   13 (4 blank)      8
amq63-persistent-ssl                            An example JBoss A-MQ application. For more information about using this temp...   18 (6 blank)      12
amq63-ssl                                       An example JBoss A-MQ application. For more information about using this temp...   16 (6 blank)      10
apicurito                                       Design beautiful, functional APIs with zero coding, using a visual designer f...   7 (1 blank)       7
cache-service                                   Red Hat Data Grid is an in-memory, distributed key/value store.                    8 (1 blank)       4
cakephp-mysql-example                           An example CakePHP application with a MySQL database. For more information ab...   21 (4 blank)      8
cakephp-mysql-persistent                        An example CakePHP application with a MySQL database. For more information ab...   22 (4 blank)      9
centos-stream8-desktop-large                    Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream8-desktop-medium                   Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream8-desktop-small                    Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream8-desktop-tiny                     Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream8-server-large                     Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream8-server-medium                    Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream8-server-small                     Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream8-server-tiny                      Template for CentOS Stream 8 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-desktop-large                    Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-desktop-medium                   Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-desktop-small                    Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-desktop-tiny                     Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-server-large                     Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-server-medium                    Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-server-small                     Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos-stream9-server-tiny                      Template for CentOS Stream 9 VM or newer. A PVC with the CentOS Stream disk i...   4 (2 generated)   1
centos7-desktop-large                           Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
centos7-desktop-medium                          Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
centos7-desktop-small                           Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
centos7-desktop-tiny                            Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
centos7-server-large                            Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
centos7-server-medium                           Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
centos7-server-small                            Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
centos7-server-tiny                             Template for CentOS 7 VM or newer. A PVC with the CentOS disk image must be a...   4 (2 generated)   1
dancer-mysql-example                            An example Dancer application with a MySQL database. For more information abo...   18 (5 blank)      8
dancer-mysql-persistent                         An example Dancer application with a MySQL database. For more information abo...   19 (5 blank)      9
datagrid-service                                Red Hat Data Grid is an in-memory, distributed key/value store.                    7 (1 blank)       4
datavirt64-basic-s2i                            Application template for JBoss Data Virtualization 6.4 services built using S2I.   20 (6 blank)      6
datavirt64-extensions-support-s2i               An example JBoss Data Virtualization application. For more information about...    35 (9 blank)      10
datavirt64-ldap-s2i                             Application template for JBoss Data Virtualization 6.4 services that configur...   21 (6 blank)      6
datavirt64-secure-s2i                           An example JBoss Data Virtualization application. For more information about...    51 (22 blank)     8
decisionserver64-amq-s2i                        An example BRMS decision server A-MQ application. For more information about...    30 (5 blank)      10
decisionserver64-basic-s2i                      Application template for Red Hat JBoss BRMS 6.4 decision server applications...    17 (5 blank)      5
django-psql-example                             An example Django application with a PostgreSQL database. For more informatio...   19 (5 blank)      8
django-psql-persistent                          An example Django application with a PostgreSQL database. For more informatio...   20 (5 blank)      9
eap-xp3-basic-s2i                               Example of an application based on JBoss EAP XP. For more information about u...   20 (5 blank)      8
eap74-basic-s2i                                 An example JBoss Enterprise Application Platform application. For more inform...   20 (5 blank)      8
eap74-https-s2i                                 An example JBoss Enterprise Application Platform application configured with...    30 (11 blank)     10
eap74-sso-s2i                                   An example JBoss Enterprise Application Platform application Single Sign-On a...   50 (21 blank)     10
fedora-desktop-large                            Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-desktop-medium                           Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-desktop-small                            Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-desktop-tiny                             Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-highperformance-large                    Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-highperformance-medium                   Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-highperformance-small                    Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-highperformance-tiny                     Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-server-large                             Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-server-medium                            Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-server-small                             Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fedora-server-tiny                              Template for Fedora 34 VM or newer. A PVC with the Fedora disk image must be...    4 (2 generated)   1
fuse710-console                                 The Red Hat Fuse Console eases the discovery and management of Fuse applicati...   8 (1 blank)       5
httpd-example                                   An example Apache HTTP Server (httpd) application that serves static content....   9 (3 blank)       5
jenkins-ephemeral                               Jenkins service, without persistent storage....                                    11 (all set)      7
jenkins-ephemeral-monitored                     Jenkins service, without persistent storage. ...                                   12 (all set)      8
jenkins-persistent                              Jenkins service, with persistent storage....                                       13 (all set)      8
jenkins-persistent-monitored                    Jenkins service, with persistent storage. ...                                      14 (all set)      9
jws31-tomcat7-basic-s2i                         Application template for JWS applications built using S2I.                         12 (3 blank)      5
jws31-tomcat7-https-s2i                         An example JBoss Web Server application configured for use with https. For mo...   17 (5 blank)      7
jws31-tomcat8-basic-s2i                         An example JBoss Web Server application. For more information about using thi...   12 (3 blank)      5
jws31-tomcat8-https-s2i                         An example JBoss Web Server application. For more information about using thi...   17 (5 blank)      7
jws56-openjdk11-tomcat9-ubi8-basic-s2i          An example JBoss Web Server application. For more information about using thi...   10 (3 blank)      5
jws56-openjdk11-tomcat9-ubi8-https-s2i          An example JBoss Web Server application. For more information about using thi...   15 (5 blank)      7
jws56-openjdk8-tomcat9-ubi8-basic-s2i           An example JBoss Web Server application. For more information about using thi...   10 (3 blank)      5
jws56-openjdk8-tomcat9-ubi8-https-s2i           An example JBoss Web Server application. For more information about using thi...   15 (5 blank)      7
mariadb-ephemeral                               MariaDB database service, without persistent storage. For more information ab...   8 (3 generated)   3
mariadb-persistent                              MariaDB database service, with persistent storage. For more information about...   9 (3 generated)   4
mysql-ephemeral                                 MySQL database service, without persistent storage. For more information abou...   8 (3 generated)   3
mysql-persistent                                MySQL database service, with persistent storage. For more information about u...   9 (3 generated)   4
nginx-example                                   An example Nginx HTTP server and a reverse proxy (nginx) application that ser...   10 (3 blank)      5
nodejs-postgresql-example                       An example Node.js application with a PostgreSQL database. For more informati...   18 (4 blank)      8
nodejs-postgresql-persistent                    An example Node.js application with a PostgreSQL database. For more informati...   19 (4 blank)      9
openjdk-web-basic-s2i                           An example Java application using OpenJDK. For more information about using t...   9 (1 blank)       5
postgresql-ephemeral                            PostgreSQL database service, without persistent storage. For more information...   7 (2 generated)   3
postgresql-persistent                           PostgreSQL database service, with persistent storage. For more information ab...   8 (2 generated)   4
processserver64-amq-mysql-persistent-s2i        An example BPM Suite application with A-MQ and a MySQL database. For more inf...   49 (13 blank)     14
processserver64-amq-mysql-s2i                   An example BPM Suite application with A-MQ and a MySQL database. For more inf...   47 (13 blank)     12
processserver64-amq-postgresql-persistent-s2i   An example BPM Suite application with A-MQ and a PostgreSQL database. For mor...   46 (10 blank)     14
processserver64-amq-postgresql-s2i              An example BPM Suite application with A-MQ and a PostgreSQL database. For mor...   44 (10 blank)     12
processserver64-basic-s2i                       An example BPM Suite application. For more information about using this templ...   17 (5 blank)      5
processserver64-externaldb-s2i                  An example BPM Suite application with a external database. For more informati...   47 (22 blank)     7
processserver64-mysql-persistent-s2i            An example BPM Suite application with a MySQL database. For more information...    40 (14 blank)     10
processserver64-mysql-s2i                       An example BPM Suite application with a MySQL database. For more information...    39 (14 blank)     9
processserver64-postgresql-persistent-s2i       An example BPM Suite application with a PostgreSQL database. For more informa...   37 (11 blank)     10
rails-pgsql-persistent                          An example Rails application with a PostgreSQL database. For more information...   21 (4 blank)      9
rails-postgresql-example                        An example Rails application with a PostgreSQL database. For more information...   20 (4 blank)      8
redis-ephemeral                                 Redis in-memory data structure store, without persistent storage. For more in...   5 (1 generated)   3
redis-persistent                                Redis in-memory data structure store, with persistent storage. For more infor...   6 (1 generated)   4
rhdm711-authoring                               Application template for a non-HA persistent authoring environment, for Red H...   76 (46 blank)     11
rhdm711-authoring-ha                            Application template for a HA persistent authoring environment, for Red Hat D...   92 (47 blank)     17
rhdm711-kieserver                               Application template for a managed KIE Server, for Red Hat Decision Manager 7...   61 (42 blank)     6
rhdm711-prod-immutable-kieserver                Application template for an immutable KIE Server in a production environment,...   66 (45 blank)     8
rhdm711-prod-immutable-kieserver-amq            Application template for an immutable KIE Server in a production environment...    80 (54 blank)     20
rhdm711-trial-ephemeral                         Application template for an ephemeral authoring and testing environment, for...    63 (40 blank)     8
rhel6-desktop-large                             Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel6-desktop-medium                            Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel6-desktop-small                             Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel6-desktop-tiny                              Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel6-server-large                              Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel6-server-medium                             Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel6-server-small                              Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel6-server-tiny                               Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-desktop-large                             Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-desktop-medium                            Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-desktop-small                             Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-desktop-tiny                              Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-highperformance-large                     Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-highperformance-medium                    Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-highperformance-small                     Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-highperformance-tiny                      Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-server-large                              Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-server-medium                             Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-server-small                              Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel7-server-tiny                               Template for Red Hat Enterprise Linux 7 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-desktop-large                             Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-desktop-medium                            Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-desktop-small                             Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-desktop-tiny                              Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-highperformance-large                     Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-highperformance-medium                    Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-highperformance-small                     Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-highperformance-tiny                      Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-server-large                              Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-server-medium                             Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-server-small                              Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel8-server-tiny                               Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-desktop-large                             Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-desktop-medium                            Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-desktop-small                             Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-desktop-tiny                              Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-highperformance-large                     Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-highperformance-medium                    Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-highperformance-small                     Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-highperformance-tiny                      Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-server-large                              Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-server-medium                             Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-server-small                              Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhel9-server-tiny                               Template for Red Hat Enterprise Linux 9 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
rhpam711-authoring                              Application template for a non-HA persistent authoring environment, for Red H...   80 (46 blank)     12
rhpam711-authoring-ha                           Application template for a HA persistent authoring environment, for Red Hat P...   101 (47 blank)    20
rhpam711-kieserver-externaldb                   Application template for a managed KIE Server with an external database, for...    83 (59 blank)     8
rhpam711-kieserver-mysql                        Application template for a managed KIE Server with a MySQL database, for Red...    70 (42 blank)     9
rhpam711-kieserver-postgresql                   Application template for a managed KIE Server with a PostgreSQL database, for...   71 (42 blank)     9
rhpam711-managed                                Application template for a managed HA production runtime environment, for Red...   87 (46 blank)     14
rhpam711-prod                                   Application template for a managed HA production runtime environment, for Red...   102 (55 blank)    28
rhpam711-prod-immutable-kieserver               Application template for an immutable KIE Server in a production environment,...   76 (45 blank)     11
rhpam711-prod-immutable-kieserver-amq           Application template for an immutable KIE Server in a production environment...    97 (58 blank)     23
rhpam711-prod-immutable-monitor                 Application template for a router and monitoring console in a production envi...   66 (44 blank)     14
rhpam711-trial-ephemeral                        Application template for an ephemeral authoring and testing environment, for...    63 (40 blank)     8
s2i-fuse710-spring-boot-2-camel                 Spring Boot 2 and Camel QuickStart. This example demonstrates how you can use...   18 (3 blank)      3
s2i-fuse710-spring-boot-2-camel-rest-3scale     Spring Boot 2, Camel REST DSL and 3Scale QuickStart. This example demonstrate...   19 (3 blank)      5
s2i-fuse710-spring-boot-2-camel-xml             Spring Boot 2 and Camel Xml QuickStart. This example demonstrates how you can...   18 (3 blank)      3
sso72-https                                     An example RH-SSO 7 application. For more information about using this templa...   26 (15 blank)     6
sso72-mysql                                     An example RH-SSO 7 application with a MySQL database. For more information a...   36 (20 blank)     8
sso72-mysql-persistent                          An example RH-SSO 7 application with a MySQL database. For more information a...   37 (20 blank)     9
sso72-postgresql                                An example RH-SSO 7 application with a PostgreSQL database. For more informat...   33 (17 blank)     8
sso72-postgresql-persistent                     An example RH-SSO 7 application with a PostgreSQL database. For more informat...   34 (17 blank)     9
sso73-https                                     An example application based on RH-SSO 7.3 image. For more information about...    27 (16 blank)     6
sso73-mysql                                     An example application based on RH-SSO 7.3 image. For more information about...    37 (21 blank)     8
sso73-mysql-persistent                          An example application based on RH-SSO 7.3 image. For more information about...    38 (21 blank)     9
sso73-ocp4-x509-https                           An example application based on RH-SSO 7.3 image. For more information about...    13 (7 blank)      5
sso73-ocp4-x509-mysql-persistent                An example application based on RH-SSO 7.3 image. For more information about...    24 (12 blank)     8
sso73-ocp4-x509-postgresql-persistent           An example application based on RH-SSO 7.3 image. For more information about...    21 (9 blank)      8
sso73-postgresql                                An example application based on RH-SSO 7.3 image. For more information about...    34 (18 blank)     8
sso73-postgresql-persistent                     An example application based on RH-SSO 7.3 image. For more information about...    35 (18 blank)     9
sso74-https                                     An example application based on RH-SSO 7.4 on OpenJDK image. For more informa...   27 (16 blank)     6
sso74-ocp4-x509-https                           An example application based on RH-SSO 7.4 on OpenJDK image. For more informa...   13 (7 blank)      5
sso74-ocp4-x509-postgresql-persistent           An example application based on RH-SSO 7.4 on OpenJDK image. For more informa...   21 (9 blank)      8
sso74-postgresql                                An example application based on RH-SSO 7.4 on OpenJDK image. For more informa...   34 (18 blank)     8
sso74-postgresql-persistent                     An example application based on RH-SSO 7.4 on OpenJDK image. For more informa...   35 (18 blank)     9
sso75-https                                     An example application based on RH-SSO 7.5 on OpenJDK image. For more informa...   27 (16 blank)     6
sso75-ocp4-x509-https                           An example application based on RH-SSO 7.5 on OpenJDK image. For more informa...   13 (7 blank)      5
sso75-ocp4-x509-postgresql-persistent           An example application based on RH-SSO 7.5 on OpenJDK image. For more informa...   21 (9 blank)      8
sso75-postgresql                                An example application based on RH-SSO 7.5 on OpenJDK image. For more informa...   34 (18 blank)     8
sso75-postgresql-persistent                     An example application based on RH-SSO 7.5 on OpenJDK image. For more informa...   35 (18 blank)     9
windows10-desktop-large                         Template for Microsoft Windows 10 VM. A PVC with the Windows disk image must...    3 (1 generated)   1
windows10-desktop-medium                        Template for Microsoft Windows 10 VM. A PVC with the Windows disk image must...    3 (1 generated)   1
windows10-highperformance-large                 Template for Microsoft Windows 10 VM. A PVC with the Windows disk image must...    3 (1 generated)   1
windows10-highperformance-medium                Template for Microsoft Windows 10 VM. A PVC with the Windows disk image must...    3 (1 generated)   1
windows2k12r2-highperformance-large             Template for Microsoft Windows Server 2012 R2 VM. A PVC with the Windows disk...   3 (1 generated)   1
windows2k12r2-highperformance-medium            Template for Microsoft Windows Server 2012 R2 VM. A PVC with the Windows disk...   3 (1 generated)   1
windows2k12r2-server-large                      Template for Microsoft Windows Server 2012 R2 VM. A PVC with the Windows disk...   3 (1 generated)   1
windows2k12r2-server-medium                     Template for Microsoft Windows Server 2012 R2 VM. A PVC with the Windows disk...   3 (1 generated)   1
windows2k16-highperformance-large               Template for Microsoft Windows Server 2016 VM. A PVC with the Windows disk im...   3 (1 generated)   1
windows2k16-highperformance-medium              Template for Microsoft Windows Server 2016 VM. A PVC with the Windows disk im...   3 (1 generated)   1
windows2k16-server-large                        Template for Microsoft Windows Server 2016 VM. A PVC with the Windows disk im...   3 (1 generated)   1
windows2k16-server-medium                       Template for Microsoft Windows Server 2016 VM. A PVC with the Windows disk im...   3 (1 generated)   1
windows2k19-highperformance-large               Template for Microsoft Windows Server 2019 VM. A PVC with the Windows disk im...   3 (1 generated)   1
windows2k19-highperformance-medium              Template for Microsoft Windows Server 2019 VM. A PVC with the Windows disk im...   3 (1 generated)   1
windows2k19-server-large                        Template for Microsoft Windows Server 2019 VM. A PVC with the Windows disk im...   3 (1 generated)   1
windows2k19-server-medium                       Template for Microsoft Windows Server 2019 VM. A PVC with the Windows disk im...   3 (1 generated)   1
```

Additionally, you may copy and customize these templates if you wish.  The [template file](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/charts/hub/edge-gitops-vms/templates/rhel8-kiosk-with-svc.yaml) is an example of a customized template that was used to help develop this pattern.

### Creating a VM from the Console via Template

These templates can be run through the OpenShift Console from the Virtualization tab.  Note the "Create VM" buttons on the right side of this picture:

[![console-template-vm-1](/images/ansible-edge-gitops/aeg-console-vm-template-1.png)](/images/ansible-edge-gitops/aeg-console-vm-template-1.png)

Clicking on the "Create VM" button will bring up a wizard that looks like this:

[![console-template-wizard](/images/ansible-edge-gitops/console-vm-template-wizard.png)](/images/ansible-edge-gitops/console-vm-template-wizard.png)

Accepting the defaults from this wizard will give a success screen:

[![console-template-wizard-success](/images/ansible-edge-gitops/console-vm-template-wizard-success.png)](/images/ansible-edge-gitops/console-vm-template-wizard-success.png)

Until it is deleted, you can monitor the machine's lifecycle from the VirtualMachines tab:

[![console-monitor-vm](/images/ansible-edge-gitops/console-vm-spinning-up.png)](/images/ansible-edge-gitops/console-vm-spinning-up.png)

This is a great way to gain familiarity with how the system works, but we might possibly want an interface we can use more programmatically.

### Creating a VM from the command line via `oc process`

This is a useful way to understand what kinds of objects OpenShift Virtualization creates and manages:

```text
$ oc process -n openshift rhel8-desktop-medium | oc apply -f -
virtualmachine.kubevirt.io/rhel8-q63yuvxpjdvy18l7 created
```

You could also use the "Create VM Wizard" in the OpenShift console.

### Another option - capturing template output and converting it into a Helm Chart

See details [here](/patterns/ansible-edge-gitops/ideas-for-customization/#howto-define-your-own-vm-sets-from-scratch).

## Components of the [virtual-machines](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/charts/hub/edge-gitops-vms/templates/virtual-machines.yaml) template

### Setup - the mechanism for creating identifiers declaratively

The first part of the template file sets up some variables that we will use later as the template is expanded. We use a
sequential numbering scheme for VM name creation because that is an easy way to make each item in the set declarative - it ensures that if you ask for 5 VMs of a particular type, they will have predictable names, and if one is deleted, it will be replaced by a VM with the same name.

We use explicit "range" variables for the Go templating. This is because the implicit range variable is easily "trampled", and we have at least two different dimensions to iterate on - vm "role" and "index" within that role.

### The External Secret - SSH pubkey

The first item we define as part of this structure is an external secret to hold an SSH pubkey. This pubkey will be mounted in the VM under an unprivileged user's home directory - and generally that unprivileged user is expected to be able to sudo root without password. By default, RHEL images are configured to only allow SSH access via pubkey. In this pattern, the private key and public key for the SSH connections are loaded into both Vault (which we inherited from previous patterns) and Ansible Automation Platform.

Since the keys are defined per VM "group", it is possible and expected that you could have different keypairs for different groups of VMs. Nothing would prevent you from using the same keypair for all machines if you have different groups, though.

While the pubkey is not truly a "secret", the availability of the External Secrets Operator made for a nice opportunity to allow for variance in configuration without necessarily requiring local customization of the pattern. The OpenShift Virtualization model has no way of knowing that multiple servers may have the same SSH credentials, and in fact cannot depend on this. So it creates a pubkey object by default for each VM, and we imitate this behavior in the pattern.

### The VirtualMachine definition

The VirtualMachine definition is the biggest part of the template. All of it is derived from customization of the default templates that OpenShift Virtualization installs in the `openshift` namespace - especially most of the labels and annotations, with the following exceptions:

#### labels

* app

This is set to `$identifier` to match a general pattern with other applications.

* edge-gitops-role

This is set explicitly and used elsewhere in this pattern to help identify resources by role. The intention is to be able to use the edge-gitops-role as a selector for targeting various kind of queries, including (especially) Ansible inventories. Though please note - because of the way Kubernetes (and OpenShift) work, when you connect to a VM with Ansible you are connecting to the *Service* object directly, not to the VM.  (Another way to look at it is that the Service object is providing network abstraction over the VM object.)

Other resources in the rest of the VirtualMachine definition are copied from the default template, with appropriate Helm variables included.

#### Initial user access

Note that the initial user (default: `cloud-user`) and initial password are customizable via values overrides. The `kiosk` type shows an example of how to either use a user/password specific to the type or a default for the chart using the `coalesce` function.

### The Service definition

The Service definition is potentially complex. The purpose of this Service object is to expose all of the needed TCP and UDP network ports within the cluster. (Providing access to them from outside the cluster would require Route or Ingress objects, and would have some significant security implications; access to these entities from outside the cluster is not the focus of this pattern, so we do not provide it at this time.)

A given VM may expose one port (for Ansible access, you need at least TCP/22), or it may expose many ports. You are free to define a service per port if you like, but it seems more convenient to define them all as a single service.

One aspect of the templating you may find interesting is the use of the toPrettyJson filter in Go. Since YAML is a proper superset of JSON, this is a neat trick that allows to include a nested data structure without having to worry about how to indent it.  (As toPrettyJson uses the square bracket ([]) and curly bracket ({}) notation for arrays and hashes, YAML can interpret it without worrying about its indentation.

## Accessing the VMs

There are three mechanisms for access to these VMs:

### Ansible - keypair authentication

The ssh keypairs from your values-secret.yaml are loaded into both Vault and AAP for use later. The pattern currently
defines one such keypair, `kiosk-ssh`, but could support more, such as `iot-ssh`, `gateway-ssh`, etc. more details on how to expand on this pattern are described below.

AAP only needs the private key and the username as a machine credential. The public key is not truly a secret, but it seemed interesting and useful to use the external secret operator to associate the public key with VM instances this way and prevent having to diverge from the upstream pattern to include local ssh pubkey specifications.

Note that the default SSH setting for RHEL does not allow password-based logins via SSH, and it's at the very least inconvenient to copy the SSH private key into a VM inside the cluster, so the typical way the keypair will be used is through Ansible.

### Virtual Machine Console Access via OpenShift Console

Navigate to Virtualization -> VirtualMachines and make sure Project: All Projects or edge-gitops-vms is selected:

[![show-vms](/images/ansible-edge-gitops/aeg-show-vms.png)](/images/ansible-edge-gitops/aeg-show-vms.png)

Click on the "three dots" menu on the right, which will open a dialog like the following:

[![show-vm-open-console](/images/ansible-edge-gitops/aeg-open-vm-console.png)](/images/ansible-edge-gitops/aeg-open-vm-console.png)

*Note:* In OpenShift Virtualization 4.11, the "Open Console" option appears when you click on the virtual machine name in openshift console. The dialog looks like this:

[![kubevirt411-vm-open-console](/images/ansible-edge-gitops/aeg-kubevirt411-con-ignition.png)](/images/ansible-edge-gitops/aeg-kubevirt411-con-ignition.png)

The virtual machine console view will either show a standard RHEL console login screen, or if the demo is working as designed, it will show the Ignition application running in kiosk mode. If the console shows a standard RHEL login, it can be accessed using the the initial user name (`cloud-user` by default) and password (which is what is specified in the Helm chart Values as either the password specific to that machine group, the default cloudInit, or a hardcoded default which can be seen in the template [here](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/charts/hub/edge-gitops-vms/templates/virtual-machines.yaml). On a VM created through the wizard or via `oc process` from a template, the password will be set on the VirtualMachine object in the `volumes` section.

### Initial User login (cloud-user)

In general, and before the VMs have been configured by the Ansible Jobs, you can log in to the VMs on the console using the user and password you specified in the Helm chart, or else you can look at the VirtualMachine object and see what the username and password setting are. The pattern, by design, replaces the typical console view with Firefox running in kiosk mode. But this mechanism can still be used if you change the console from "VNC Console" to "Serial Console".

# The "extra" VM Template

Also included in the edge-gitops-vms chart is a separate template that will allow the creation of VMs with similar (though not identical characteristics) to the ones defined in the chart.

The [rhel8-kiosk-with-svc](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/charts/hub/edge-gitops-vms/templates/rhel8-kiosk-with-svc.yaml) template is preserved as an intermediate step to creating your own VM types, to see how the pipeline from default VM template -> customized template -> Helm-variable chart can work.

# Next Steps

## [Help & Feedback](https://groups.google.com/g/validatedpatterns)
## [Report Bugs](https://github.com/validatedpatterns/ansible-edge-gitops/issues)
