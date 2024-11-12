const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const express = require("express");
let listContacts = require("../../models/contacts.json");

const schema = Joi.object({
  name: Joi.string().alphanum().min(2).max(40).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "pl"] },
    })
    .required(),
  phone: Joi.number().integer().min(7).max(10).required(),
});

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (listContacts) {
    res.status(200).json(listContacts);
  } else {
    res.json({ message: "template message get / error" });
  }
});

router.get("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  console.log(id);

  const contact = listContacts.find((contact) => contact.id === id);
  if (!contact) {
    res.status(404).json({
      message: "Contact not found.template message get /:contactId",
    });
  } else {
    res.status(200).json(contact);
  }
});

router.post("/", async (req, res, next) => {
  const validBody = schema.validate(req.body);
  const { name, email, phone } = validBody;
  const id = uuidv4();
  const newContact = {
    id,
    name,
    email,
    phone,
  };
  res.status(201).json(newContact);
  res.json({ message: "template message post /" });
});

router.delete("/:contactId", async (req, res, next) => {
  const id = req.params.id;
  const newContacts = listContacts.filter((contact) => contact.id !== id);
  listContacts = [...newContacts];
  res.status(204).json({ message: "template message delete /:contactId" });
});

router.put("/:contactId", async (req, res, next) => {
  const validBody = schema.validate(req.body);
  if (!req.body) {
    res.status(400).json({ message: "missing fields" });
  } else {
    const { name, email, phone } = validBody;
    const id = uuidv4();
    const newContact = {
      id,
      name,
      email,
      phone,
    };
    res.status(201).json(newContact);
  }
});

module.exports = router;
