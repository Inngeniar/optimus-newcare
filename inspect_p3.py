import docx

doc = docx.Document('Manual NEWCARE INTERNO - Optimus Health .docx')
for i in range(375, 392):
    p = doc.paragraphs[i]
    print(f"{i} [{p.style.name}]: '{p.text}'")
