import { useParams } from "react-router-dom";

export default function GameDetails() {
  const { id } = useParams();

  return (
    <div>
      <h2>Game Details Page</h2>
      <p>Viewing game id: {id}</p>
    </div>
  );
}
