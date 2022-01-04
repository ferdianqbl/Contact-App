const fs = require("fs");

// if dirPath didn't exist
const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// if dataPath didn't exist
const dataPath = "./data/contacts.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

const loadContact = () => {
  let contacts = fs.readFileSync("data/contacts.json", "utf-8");

  // to JSON format
  const contactsJSON = JSON.parse(contacts);

  return contactsJSON;
};

// find contact spesific
const findContact = (data) => {
  const contactsJSON = loadContact();

  const contact = contactsJSON.find(
    (contact) => contact.name.toLowerCase() === data.toLowerCase()
  );

  return contact;
};

// saveContacts
const saveContacts = (contacts) => {
  fs.writeFileSync("./data/contacts.json", JSON.stringify(contacts));
};

// add Contact
const addContact = (contact) => {
  const contacts = loadContact();

  contacts.push(contact);

  saveContacts(contacts);
};

const checkDuplicate = (name) => {
  const contacts = loadContact();

  return contacts.find((contact) => contact.name === name);
};

// delete contact
const deleteContact = (name) => {
  const contacts = loadContact();

  const newContacts = contacts.filter((contact) => contact.name !== name);

  saveContacts(newContacts);

}

// update contact information
const updateContacts = (newContact) => {
  const contacts = loadContact();

  // delete contact information that same with oldContact information
  const filteredContacts = contacts.filter(contact => contact.name !== newContact.oldName);
  // console.log(filteredContacts, newContact);

  delete newContact.oldName;
  filteredContacts.push(newContact);

  saveContacts(filteredContacts);
}

module.exports = { loadContact, findContact, addContact, checkDuplicate, deleteContact, updateContacts };
