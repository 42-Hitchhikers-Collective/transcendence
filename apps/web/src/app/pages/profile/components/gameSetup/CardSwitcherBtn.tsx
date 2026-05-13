// import { Button } from "@/shared/components/ui/button";
// import { GameOptions, type Option } from "./SetupCard";

// const activeButtonStyle = "bg-primary text-primary-foreground";
// const inactiveButtonStyle =
//   "bg-slate-200 text-slate-500 hover:bg-amber-300 hover:text-white";

// export function CardSwitcherBtn({
//   activeOption,
//   setActiveOption,
// }: {
//   activeOption: Option;
//   setActiveOption: (tab: Option) => void;
// }) {
//   return (
//     <div className="border-b pt-6">
//       <div className="flex gap-2">
//         <Button
//           type="button"
//           className={
//             activeOption === GameOptions.CreateRoom
//               ? activeButtonStyle
//               : inactiveButtonStyle
//           }
//           onClick={() => setActiveOption(GameOptions.CreateRoom)}
//         >
//           Create a room
//         </Button>
//         <Button
//           type="button"
//           className={
//             activeOption === GameOptions.JoinRandomRoom
//               ? activeButtonStyle
//               : inactiveButtonStyle
//           }
//           onClick={() => setActiveOption(GameOptions.JoinRandomRoom)}
//         >
//           Join a random room
//         </Button>

//         <Button
//           type="button"
//           className={
//             activeOption === GameOptions.CreateLinkRoom
//               ? activeButtonStyle
//               : inactiveButtonStyle
//           }
//           onClick={() => setActiveOption(GameOptions.CreateLinkRoom)}
//         >
//           Create a link room
//         </Button>
//       </div>
//     </div>
//   );
// }
