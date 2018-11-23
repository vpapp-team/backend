#!/bin/bash

# enforce root
if [ "$(id -u)" != "0" ]; then
  echo "This script must be run as root" 1>&2
  exit 1
fi
# enforce nodejs
if ! [ "$(command -v node)" ]; then
  echo "This script requires nodejs to be installed" 1>&2
  exit 1
fi

# installing mysql server
echo "--- installing mysql server"
apt-get install mysql-server -y
# securing mysql installation
echo "--- securing mysql installation"
mysql_secure_installation

# collecting user inputs
echo "--- collecting user inputs"
GetUserInputs

# loading sql template
echo "--- loading sql template"
LoadMysqlSchemes

# save progress to db
echo "--- saving setup profiles to db"
SetupUser true $DB_NAME $USER_READ $PW_READ
SetupUser false $DB_NAME $USER_READ $PW_READ
SetupWebadmin $USER_WEBADMIN $PW_WEBADMIN

# save credentials to file
echo "--- backing up data to file"
cat << EOF > "/root/mysql_credentials"
READING USER:
UNAME: ${USER_READ}
PW:    ${PW_READ}

WRITING USER:
UNAME: ${USER_WRITE}
PW:    ${PW_WRITE}

WEBADMIN:
UNAME: ${USER_WEBADMIN}
PW:    ${PW_WEBADMIN}

EOF
echo "--------------------------------------------"
echo "saved credentials to /root/mysql_credentials"

LoadMysqlSchemes () {
  mysql -u root -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`"
  mysql -u root -e "CREATE DATABASE \`${DB_NAME}\`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci"
  scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
  mysql -u root -D ${DB_NAME} < "$scriptDir/.sqltables.template.sql"
}

# Defines in Global:
  # string:DB_NAME
  # string:USER_READ
  # string:PW_READ
  # string:USER_WRITE
  # string:PW_WRITE
  # string:USER_WEBADMIN
  # string:PW_WEBADMIN
GetUserInputs () {
  read -e -p "Name of Database:" -i "NIGB" DB_NAME

  read -e -p "Name for reading user:" -i "NIGBread" USER_READ
  PW_READ=$(RandomPW 128)

  read -e -p "Name for writing user:" -i "NIGBwrite" USER_WRITE
  PW_WRITE=$(RandomPW 128)

  read -e -p "Name for Webadmin:" -i "admin" USER_WEBADMIN
  PW_WEBADMIN=$(RandomPW 128)
}

# $1 boolean:readonly
# $2 string:database name
# $3 string:username
# $4 string:userpassword
SetupUser () {
  local privileges="SELECT"
  if [ "$1" -eq 1 ]; then privileges="ALL"; fi
  mysql -u root -e "DROP USER IF EXISTS $3"
  mysql -u root -e "CREATE USER '$3'@'%' IDENTIFIED BY '$4'"
  mysql -u root -e "GRANT ${privileges} ON $2.* TO '$3'@'%'"
  echo "--- added user"
}

# $1 string:username
# $2 string:userpassword
SetupWebadmin () {
  local salt=$(node -p -e "((length) => require('crypto').randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length))(128)")
  local hash=$(node -p -e "((password, salt) => require('crypto').createHmac('sha512', salt).update(password).digest('hex'))('$2', '$salt')")
  mysql -u root -e "INSERT INTO \`WebAdmins\` (\`hashAlgorithm\`, \`username\`, \`pwHash\`, \`salt\`) VALUES('sha512', '$1', '$hash', '$salt')"
}

# $1 int:length of password
RandomPW () {
  echo "$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w $1 | head -n 1)"
}

# TODO: change mysql port in /etc/my.cnf under [mysqld]
