### Javascript library for lighning network

WIP

parse a payment request

* general
    * ✔ request
    * ✔ prefix
    * ✔ amount
    * ✔ timestamp
    * tagged fields
        * ✔ payment_hash
        * ✔ description
        * ✔ payee_pubkey
        * ✔ purpose_hash
        * ✔ expiry
        * ✔ min_final_cltv_expiry
        * ❓ witness - this is parsing but unsure of terminology
        * ✔ routing
    * ✔ signature

encoding

* general
    * ✔ prefix
    * ✔ amount
    * ✔ timestamp
    * tagged fields
        * ✔ payment_hash
        * ✔ description
        * ✔ payee_pubkey
        * ✔ purpose_hash
        * ✔ expiry
        * ✔ min_final_cltv_expiry
        * witness - something up with version?
        * routing
    * ✔ signature
