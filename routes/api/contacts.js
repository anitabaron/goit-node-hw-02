const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const express = require("express");
let listContacts = require("../../models/contacts.json");

const schema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
    .min(2)
    .max(40)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "pl"] },
    })
    .required(),
  phone: Joi.number().integer().required(),
});

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (!listContacts) {
    res.json({ message: "Contacts list not found." });
  } else {
    res.status(200).json(listContacts);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  const contact = listContacts.find((contact) => contact.id === id);
  if (!contact) {
    res.status(404).json({
      message: "Contact not found.",
    });
  } else {
    res.status(200).json(contact);
  }
});

router.post("/", async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: "Missing fields", error: error.details });
  } else {
    const { name, email, phone } = value;
    const id = uuidv4();
    const newContact = {
      id,
      name,
      email,
      phone,
    };
    listContacts.push(newContact);
    res.status(201).json({ message: "Contact created" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  const contactExists = listContacts.some((contact) => contact.id === id);
  if (!id) {
    res.status(404).json({ message: "Id is required to delete contact" });
  } else if (!contactExists) {
    res.status(404).json({ message: "Contact not found" });
  } else {
    const filtredContacts = listContacts.filter((contact) => contact.id !== id);
    listContacts = [...filtredContacts];
    res.status(200).json({ message: "Contact deleted" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: "Missing fields", error: error.details });
    return;
  }
  const { name, email, phone } = value;
  const { contactId } = req.params;
  const existingContact = listContacts.find(
    (contact) => contact.id === contactId
  );
  if (!existingContact) {
    res.status(404).json({ message: "Contact not found" });
    return;
  }
  if (existingContact) {
    existingContact.name = name;
    existingContact.email = email;
    existingContact.phone = phone;
    res.status(200).json(existingContact);
  }
});

module.exports = router;
