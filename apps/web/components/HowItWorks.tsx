export default function HowItWorks() {
    const steps = [
      {
        number: "01",
        title: "Verify Identity",
        description:
          "Securely verify your Aadhaar or Passport once."
      },
      {
        number: "02",
        title: "Upload Booking",
        description:
          "Link your hotel booking to your Travel ID."
      },
      {
        number: "03",
        title: "Check In",
        description:
          "Present your QR and skip paperwork at reception."
      }
    ];
  
    return (
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
  
          <h2 className="mb-14 text-center text-4xl font-bold">
            How it works
          </h2>
  
          <div className="grid gap-8 md:grid-cols-3">
  
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl bg-white p-8 shadow-sm"
              >
                <p className="text-blue-600 font-bold">
                  {step.number}
                </p>
  
                <h3 className="mt-4 text-2xl font-semibold">
                  {step.title}
                </h3>
  
                <p className="mt-3 text-gray-600 leading-7">
                  {step.description}
                </p>
              </div>
            ))}
  
          </div>
        </div>
      </section>
    );
  }