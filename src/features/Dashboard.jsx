export default function Dashboard() {
  return (
    <div className="surface-card shadow-3 border-round p-4">
      <div className="grid">
        <div className="col-12 xl:col-6">
          <div
            className="surface-section shadow-3 border-round p-4"
            style={{ minHeight: "15rem" }}
          >
            <div className="text-3xl text-center text-900 font-medium mb-5">
              Mission
            </div>
            <ul className="list-none p-0 m-0">
              <li className="surface-border">
                <div className=" line-height-3 text-600 text-justify">
                  We are pet care professionals who work as a team to help as
                  many people and their pets in our community to have the best
                  human-animal bond possible by offering optimal health,
                  excellent veterinary care, and education in a low-stress
                  environment.
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-12 xl:col-6">
          <div
            className="surface-section shadow-3 border-round p-4"
            style={{ minHeight: "15rem" }}
          >
            <div className="text-3xl text-center text-900 font-medium mb-5">
              Vision
            </div>
            <ul className="list-none p-0 m-0">
              <li className="surface-border">
                <div className="line-height-3 text-600 text-justify">
                  Our vision is to provide the highest level of pet care through
                  medical innovation, continued education, and advancements in
                  animal healthcare. We will strengthen communication with our
                  clients, and set a precedence of treating them and their pets
                  responsibly, respectfully, and individually in a family
                  environment, all while inspiring a culture of trust and
                  compassion. Through our community involvement and support, we
                  will promote and nurture the joy of the pet-human bond.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
