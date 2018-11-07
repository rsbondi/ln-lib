### Javascript library for lighning network

WIP

parse a payment request

* general
    * ✔ request
    * ✔ prefix
    * ✔ amount
    * ✔ timestamp
    * ✔ tagged
* tagged fields
    * ✔ payment_hash
    * ✔ description
    * ✔ payee_pubkey
    * ✔ purpose_hash
    * ✔ expiry
    * ✔ min_final_cltv_expiry
    * ❓ witness - this is parsing but unsure of terminology
    * ✔ routing

encoding

* general
    * prefix
    * amount
    * ✔ timestamp
    * tagged
* tagged fields
    * ✔ payment_hash
    * ✔ description
    * ✔ payee_pubkey
    * ✔ purpose_hash
    * ✔ expiry
    * ✔ min_final_cltv_expiry
    * ❓ witness
    * routing
