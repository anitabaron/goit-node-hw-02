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
  phone: Joi.string().required(),
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
    res
      .status(404)
      .json({ message: "Contact not correct", error: error.details });
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
  const id = req.params.id;
  if (!id) {
    res.status(404).json({ message: "Not found" });
  } else {
    const filtredContacts = listContacts.filter((contact) => contact.id !== id);
    listContacts = [...filtredContacts];
    res.status(204).json({ message: "contact deleted" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: "Missing fields", error: error.details });
  }
  const { name, email, phone } = value;
  const { contactId } = req.params;
  const contact = listContacts.find((contact) => contact.id === contactId);
  if (contact) {
    contact.name = name;
    contact.email = email;
    contact.phone = phone;
    res.status(200).json(contact);
  } else {
    const id = uuidv4();
    const newContact = {
      id,
      name,
      email,
      phone,
    };
    listContacts.push(newContact);
    res.status(201).json(newContact);
  }
});

module.exports = router;
